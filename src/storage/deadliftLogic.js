// Pure calculations and data handling for the Deadlift Training Planner (tested by scripts/check.mjs).
// Weights are always stored in kg. Nothing here ever raises a working weight on its own:
// recommendations are returned as suggestions and only change the plan when the user applies them.
import {
  DEADLIFT_VARIATIONS,
  DEFAULT_DEADLIFT_PLAN,
  EXPERIENCE_LEVELS,
  FREQUENCIES,
  PLATE_SIZES_KG,
  POSTERIOR_CHAIN_IDS,
  RIR_OPTIONS,
  SPLITS,
  STOP_REASONS,
  TECHNIQUE_OPTIONS,
} from '../data/deadlift';
import { getExerciseById, getPlanById, getPlanDay, getDayExercises } from '../data/workouts';
import { isValidDateKey } from '../utils/date';
import { isPlainObject } from '../utils/validation';

export const DEADLIFT_LIMITS = {
  weightKg: { min: 20, max: 500 },
  recentReps: { min: 1, max: 20 },
  workingSets: { min: 1, max: 6 },
  workingReps: { min: 1, max: 10 },
  warmupReps: { min: 1, max: 10 },
  restSeconds: { min: 60, max: 600, step: 15 },
  maxWarmups: 8,
  notesLength: 500,
  maxHistory: 300,
};

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;
const inRange = (value, { min, max }) => Number.isFinite(value) && value >= min && value <= max;
const isWhole = (value, limits) => Number.isInteger(value) && inRange(value, limits);

// ---------- Plates ----------

function cleanPlates(plates) {
  const valid = (Array.isArray(plates) ? plates : []).filter((plate) => PLATE_SIZES_KG.includes(plate));
  return valid.length > 0 ? [...new Set(valid)].sort((a, b) => b - a) : [...PLATE_SIZES_KG];
}

// Smallest possible jump in total weight: one pair of the smallest plate.
export function smallestJumpKg(plates) {
  return 2 * Math.min(...cleanPlates(plates));
}

// Rounds DOWN to a load you can actually build (used for working sets — never rounds up).
export function roundDownToPlates(kg, barKg, plates) {
  if (!Number.isFinite(kg) || kg <= barKg) return barKg;
  const jump = smallestJumpKg(plates);
  return round2(barKg + Math.floor((kg - barKg) / jump + 1e-9) * jump);
}

// Rounds to the nearest buildable load (used for warm-ups).
export function roundNearestToPlates(kg, barKg, plates) {
  if (!Number.isFinite(kg) || kg <= barKg) return barKg;
  const jump = smallestJumpKg(plates);
  return round2(barKg + Math.round((kg - barKg) / jump) * jump);
}

// Plates per side (largest first). `exact` is false if the available plates cannot make the weight.
export function plateBreakdown(kg, barKg, plates) {
  let remaining = round2((kg - barKg) / 2);
  const perSide = [];
  if (remaining > 0) {
    for (const plate of cleanPlates(plates)) {
      while (remaining + 1e-9 >= plate) {
        perSide.push(plate);
        remaining = round2(remaining - plate);
      }
    }
  }
  const perSideTotal = perSide.reduce((sum, plate) => sum + plate, 0);
  return { perSide, achievedKg: round2(barKg + 2 * perSideTotal), exact: Math.abs(remaining) < 1e-6 && kg >= barKg };
}

// ---------- Strength estimate ----------

export function rirValue(rirId) {
  return RIR_OPTIONS.find((option) => option.id === rirId)?.value ?? null;
}

// Conservative estimate from a set: the LOWER of the Epley and Brzycki formulas, using reps + reps in reserve.
// Only sets of up to 10 reps (and 12 "reps to failure") are used — longer sets are too unreliable.
export function estimateOneRm({ weightKg, reps, rir }) {
  if (!inRange(weightKg, DEADLIFT_LIMITS.weightKg) || !isWhole(reps, DEADLIFT_LIMITS.recentReps) || !Number.isFinite(rir)) {
    return { value: null, reliable: false, reason: 'Enter a weight, reps and how many reps you had left.' };
  }
  const repsToFailure = reps + rir;
  if (reps > 10 || repsToFailure > 12) {
    return { value: null, reliable: false, reason: 'Sets above 10 reps are too unreliable for an estimate.' };
  }
  const epley = weightKg * (1 + repsToFailure / 30);
  const brzycki = (weightKg * 36) / (37 - repsToFailure);
  return { value: round1(Math.min(epley, brzycki)), epley: round1(epley), brzycki: round1(brzycki), reliable: true };
}

// ---------- Suggested plan ----------

const PROGRAMS = {
  advanced: { percent: 0.675, sets: 3, reps: 3, restSeconds: 240, targetRpe: '5-6' },
  intermediate: { percent: 0.7, sets: 3, reps: 5, restSeconds: 180, targetRpe: '6-7' },
  technique: { percent: 0.5, sets: 3, reps: 5, restSeconds: 120, targetRpe: '4-5' },
  pain: { percent: 0.4, sets: 2, reps: 5, restSeconds: 120, targetRpe: '3-4' },
};

// Warm-ups: progressively heavier, fewer reps, rounded to the nearest 5 kg and to buildable loads.
export function generateWarmups(workingKg, barKg, plates) {
  const steps = [
    [0.45, 5],
    [0.7, 3],
    [0.85, 2],
    [0.92, 1],
  ];
  const warmups = [];
  if (workingKg * 0.45 < barKg + 20) warmups.push({ weightKg: barKg, reps: 8 });
  for (const [percent, reps] of steps) {
    const nearestFive = Math.round((workingKg * percent) / 5) * 5;
    const weightKg = roundNearestToPlates(nearestFive, barKg, plates);
    const previous = warmups.at(-1)?.weightKg ?? 0;
    if (weightKg > previous && weightKg < workingKg && weightKg > barKg) warmups.push({ weightKg, reps });
  }
  return warmups;
}

export function getStrengthEstimate(plan) {
  if (inRange(plan.knownOneRmKg, DEADLIFT_LIMITS.weightKg) && plan.knownOneRmKg >= (plan.recentWeightKg ?? 0)) {
    return { value: plan.knownOneRmKg, reliable: true, source: 'known' };
  }
  const estimate = estimateOneRm({ weightKg: plan.recentWeightKg, reps: plan.recentReps, rir: rirValue(plan.recentRir) });
  return { ...estimate, source: 'estimate' };
}

// Returns a transparent suggestion. It does not modify the plan.
export function suggestPlan(plan) {
  const estimate = getStrengthEstimate(plan);
  const notes = [];
  let mode;
  if (plan.painNow) {
    mode = 'pain';
    notes.push('You reported current pain. Keep loads very light or skip heavy deadlifts, and consider seeing a qualified professional.');
  } else if (!estimate.reliable) {
    mode = 'technique';
    notes.push('Not enough reliable strength data, so a light technique plan is suggested. Learning with a qualified coach is recommended.');
  } else if (plan.experience === 'beginner' || plan.frequency === 'technique') {
    mode = 'technique';
    notes.push('Technique-focused: light loads and low fatigue. Learn the movement with a qualified coach if you can.');
  } else {
    mode = plan.experience;
  }
  const program = PROGRAMS[mode];
  const base = estimate.value ? estimate.value * program.percent : plan.barKg + 20;
  const weightKg = roundDownToPlates(base, plan.barKg, plan.plates);
  if (estimate.reliable && estimate.source === 'estimate') {
    notes.push(
      `Estimated strength ≈ ${estimate.value} kg (lower of two standard formulas). This is approximate — ` +
        'not a target and not a max to test.',
    );
  }
  return {
    mode,
    estimate,
    percent: estimate.value ? Math.round(program.percent * 100) : null,
    working: { weightKg, sets: program.sets, reps: program.reps, restSeconds: program.restSeconds, targetRpe: program.targetRpe },
    warmups: generateWarmups(weightKg, plan.barKg, plan.plates),
    notes,
  };
}

// ---------- Sessions ----------

export function createDeadliftSession(plan, { id, now, type = 'heavy' }) {
  const light = type === 'light';
  const workingKg = light ? roundDownToPlates(plan.working.weightKg * 0.8, plan.barKg, plan.plates) : plan.working.weightKg;
  const sets = plan.reducedVolume ? Math.max(1, plan.working.sets - 1) : plan.working.sets;
  const warmups = light
    ? generateWarmups(workingKg, plan.barKg, plan.plates)
    : plan.warmups.filter((warmup) => warmup.weightKg < workingKg);
  return {
    id,
    startedAt: now,
    variation: plan.variation,
    type,
    restSeconds: plan.working.restSeconds,
    targetRpe: light ? '4-5' : plan.working.targetRpe,
    warmups: warmups.map((warmup) => ({ ...warmup, done: false })),
    working: Array.from({ length: sets }, () => ({ weightKg: workingKg, reps: plan.working.reps, done: false, rpe: null })),
    accessories: plan.accessories
      .filter((item) => item.enabled)
      .map((item) => ({ exerciseId: item.exerciseId, sets: item.sets, reps: item.reps, restSeconds: item.restSeconds, setsDone: 0, skipped: false })),
    checklist: {},
    notes: '',
    technique: null,
  };
}

function replaceAt(list, index, changes) {
  return list.map((item, i) => (i === index ? { ...item, ...changes } : item));
}

export function updateSessionSet(session, kind, index, changes) {
  const list = session[kind];
  if (!Array.isArray(list) || !list[index]) return session;
  const clean = {};
  if (changes.weightKg !== undefined && inRange(changes.weightKg, { min: 0, max: DEADLIFT_LIMITS.weightKg.max })) clean.weightKg = round2(changes.weightKg);
  if (changes.reps !== undefined && isWhole(changes.reps, DEADLIFT_LIMITS.warmupReps)) clean.reps = changes.reps;
  if (changes.done !== undefined) clean.done = Boolean(changes.done);
  if (changes.rpe !== undefined) clean.rpe = changes.rpe === null || inRange(changes.rpe, { min: 5, max: 10 }) ? changes.rpe : list[index].rpe;
  return { ...session, [kind]: replaceAt(list, index, clean) };
}

export function addWorkingSet(session) {
  if (session.working.length >= DEADLIFT_LIMITS.workingSets.max) return session;
  const last = session.working.at(-1) ?? { weightKg: 20, reps: 3 };
  return { ...session, working: [...session.working, { weightKg: last.weightKg, reps: last.reps, done: false, rpe: null }] };
}

export function removeWorkingSet(session) {
  if (session.working.length <= 1) return session;
  return { ...session, working: session.working.slice(0, -1) };
}

export function updateAccessory(session, index, changes) {
  const item = session.accessories[index];
  if (!item) return session;
  const next = { ...item };
  if (changes.setsDone !== undefined) next.setsDone = Math.min(item.sets, Math.max(0, Math.round(changes.setsDone)));
  if (changes.skipped !== undefined) next.skipped = Boolean(changes.skipped);
  return { ...session, accessories: replaceAt(session.accessories, index, next) };
}

export function setSetRpeEstimate(set) {
  if (!set.done || !Number.isFinite(set.rpe)) return null;
  return estimateOneRm({ weightKg: set.weightKg, reps: set.reps, rir: 10 - set.rpe }).value;
}

export function buildDeadliftRecord(session, { finishedAt, dateKey, stopReason = null }) {
  const doneWorking = session.working.filter((set) => set.done);
  const estimates = doneWorking.map(setSetRpeEstimate).filter((value) => value !== null);
  return {
    id: session.id,
    dateKey,
    startedAt: session.startedAt,
    finishedAt: Math.max(finishedAt, session.startedAt),
    variation: session.variation,
    type: session.type,
    targetRpe: session.targetRpe,
    warmups: session.warmups,
    working: session.working,
    accessories: session.accessories,
    notes: String(session.notes ?? '').slice(0, DEADLIFT_LIMITS.notesLength),
    technique: session.technique,
    stopReason,
    topSetKg: doneWorking.length ? Math.max(...doneWorking.map((set) => set.weightKg)) : null,
    e1rmKg: estimates.length ? Math.max(...estimates) : null,
  };
}

// ---------- Progress, PRs, recommendations ----------

export function computeProgress(history) {
  const heaviestByReps = {};
  let best = null;
  for (const record of history) {
    for (const set of record.working.filter((item) => item.done)) {
      if (!heaviestByReps[set.reps] || set.weightKg > heaviestByReps[set.reps].weightKg) {
        heaviestByReps[set.reps] = { weightKg: set.weightKg, dateKey: record.dateKey };
      }
    }
    if (record.e1rmKg && (!best || record.e1rmKg > best.value)) best = { value: record.e1rmKg, dateKey: record.dateKey };
  }
  const trend = [...history]
    .sort((a, b) => a.finishedAt - b.finishedAt)
    .map((record) => ({ dateKey: record.dateKey, e1rmKg: record.e1rmKg, topSetKg: record.topSetKg, variation: record.variation }));
  return { heaviestByReps, bestEstimate: best, trend };
}

function isGoodSession(record) {
  const working = record.working ?? [];
  const rpes = working.map((set) => set.rpe).filter(Number.isFinite);
  return (
    !record.stopReason &&
    record.type !== 'light' &&
    working.length > 0 &&
    working.every((set) => set.done) &&
    rpes.length === working.length &&
    Math.max(...rpes) <= 6 &&
    record.technique === 'good'
  );
}

// history: newest first. Never changes anything — returns advice and, at most, a weight to consider.
export function recommendNext(history, plan) {
  const variationHistory = history.filter((record) => record.variation === plan.variation);
  const last = variationHistory[0];
  const current = plan.working.weightKg;
  if (!last) {
    return {
      action: 'start',
      tone: 'info',
      title: 'First session',
      message: `Start with the suggested ${current} kg. If warm-ups feel unusually heavy, reduce the weight or stop.`,
      suggestedWeightKg: null,
    };
  }
  if (last.stopReason === 'pain') {
    return {
      action: 'stop',
      tone: 'danger',
      title: 'Pain was reported',
      message:
        'Do not load the deadlift heavily while you have pain. Rest, keep any training very light and pain-free, and consider a qualified professional before continuing.',
      suggestedWeightKg: null,
    };
  }
  const rpes = last.working.filter((set) => set.done && Number.isFinite(set.rpe)).map((set) => set.rpe);
  const maxRpe = rpes.length ? Math.max(...rpes) : null;
  const missed = last.working.some((set) => !set.done);
  if (last.stopReason || missed || (maxRpe !== null && maxRpe >= 8) || last.technique === 'poor') {
    const reduced = roundDownToPlates(current * 0.92, plan.barKg, plan.plates);
    return {
      action: 'reduce',
      tone: 'warning',
      title: 'Ease off next time',
      message: `Last session was hard or incomplete. Repeat at a lighter weight (around ${reduced} kg), focus on clean technique and recover well.`,
      suggestedWeightKg: reduced,
    };
  }
  let goodAtSameLoad = 0;
  for (const record of variationHistory) {
    if (record.topSetKg !== current || !isGoodSession(record)) break;
    goodAtSameLoad += 1;
  }
  if (goodAtSameLoad >= 2) {
    const next = roundDownToPlates(current + 2.5, plan.barKg, plan.plates);
    return {
      action: 'increase',
      tone: 'info',
      title: 'Consider a small increase',
      message: `${goodAtSameLoad} good sessions in a row at ${current} kg (RPE 6 or lower, good technique). If you feel recovered, you could try ${next} kg. FITME will not change it unless you choose to.`,
      suggestedWeightKg: next,
    };
  }
  return {
    action: 'repeat',
    tone: 'info',
    title: 'Repeat the same load',
    message: `Repeat ${current} kg until technique, effort (RPE 5–6) and recovery feel consistently good${maxRpe === null ? '. Log your RPE so FITME can guide you better.' : '.'}`,
    suggestedWeightKg: null,
  };
}

function containsPosteriorChain(exerciseIds) {
  return exerciseIds.some((id) => POSTERIOR_CHAIN_IDS.includes(id));
}

// Hours since the last demanding posterior-chain session (deadlift sessions or workouts with heavy hinges/squats/rows).
export function recoveryStatus({ deadliftHistory, sessions, now }) {
  const times = [
    ...deadliftHistory.filter((record) => record.type !== 'light').map((record) => record.finishedAt),
    ...sessions.filter((session) => containsPosteriorChain(session.completedExerciseIds ?? [])).map((session) => session.finishedAt),
  ].filter(Number.isFinite);
  if (times.length === 0) return { level: 'none', hours: null };
  const hours = Math.max(0, (now - Math.max(...times)) / 3600000);
  if (hours < 48) return { level: 'warning', hours };
  if (hours < 72) return { level: 'caution', hours };
  return { level: 'ok', hours };
}

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Warns when the deadlift day sits right next to another heavy posterior-chain day.
export function scheduleWarnings(plan, fallbackPlanId) {
  const split = SPLITS.find((item) => item.id === plan.split);
  const schedulePlan = getPlanById(split?.planId ?? fallbackPlanId);
  if (!schedulePlan) return [];
  const warnings = [];
  for (const offset of [-1, 1]) {
    const weekday = (plan.deadliftWeekday + offset + 7) % 7;
    const dayId = schedulePlan.schedule[weekday];
    if (!dayId) continue;
    const day = getPlanDay(schedulePlan.id, dayId).day;
    const ids = getDayExercises(day).map((exercise) => exercise.id);
    if (containsPosteriorChain(ids)) {
      warnings.push(
        `${WEEKDAY_NAMES[weekday]} (${day.title}) also has heavy posterior-chain work ${offset < 0 ? 'the day before' : 'the day after'} your deadlifts. Keep it light, or move one of them.`,
      );
    }
  }
  return warnings;
}

export function getVariation(id) {
  return DEADLIFT_VARIATIONS.find((variation) => variation.id === id) ?? DEADLIFT_VARIATIONS[0];
}

// ---------- Validation of saved data ----------

const pickId = (options, value, fallback) => (options.some((option) => option.id === value) ? value : fallback);

function cleanSets(list, { allowFlags = false } = {}) {
  if (!Array.isArray(list)) return null;
  const out = [];
  for (const set of list) {
    if (!isPlainObject(set) || !inRange(set.weightKg, { min: 0, max: DEADLIFT_LIMITS.weightKg.max }) || !isWhole(set.reps, DEADLIFT_LIMITS.warmupReps)) continue;
    const clean = { weightKg: set.weightKg, reps: set.reps };
    if (allowFlags) {
      clean.done = Boolean(set.done);
      if ('rpe' in set) clean.rpe = Number.isFinite(set.rpe) && set.rpe >= 5 && set.rpe <= 10 ? set.rpe : null;
    }
    out.push(clean);
  }
  return out;
}

function cleanAccessories(list, forSession) {
  if (!Array.isArray(list)) return null;
  return list
    .filter((item) => isPlainObject(item) && getExerciseById(item.exerciseId) && isWhole(item.sets, { min: 1, max: 6 }))
    .map((item) =>
      forSession
        ? {
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: typeof item.reps === 'string' ? item.reps.slice(0, 20) : '8-12',
            restSeconds: isWhole(item.restSeconds, DEADLIFT_LIMITS.restSeconds) ? item.restSeconds : 90,
            setsDone: isWhole(item.setsDone, { min: 0, max: item.sets }) ? item.setsDone : 0,
            skipped: Boolean(item.skipped),
          }
        : {
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: typeof item.reps === 'string' ? item.reps.slice(0, 20) : '8-12',
            restSeconds: isWhole(item.restSeconds, DEADLIFT_LIMITS.restSeconds) ? item.restSeconds : 90,
            enabled: item.enabled !== false,
          },
    );
}

export function sanitizeDeadliftPlan(raw) {
  const d = DEFAULT_DEADLIFT_PLAN;
  if (raw === undefined) return { value: structuredCloneSafe(d), isClean: true };
  if (!isPlainObject(raw)) return { value: structuredCloneSafe(d), isClean: false };
  const working = isPlainObject(raw.working) ? raw.working : {};
  const warmups = cleanSets(raw.warmups);
  const accessories = cleanAccessories(raw.accessories, false);
  const value = {
    experience: pickId(EXPERIENCE_LEVELS, raw.experience, d.experience),
    variation: pickId(DEADLIFT_VARIATIONS, raw.variation, d.variation),
    recentWeightKg: inRange(raw.recentWeightKg, DEADLIFT_LIMITS.weightKg) ? raw.recentWeightKg : null,
    recentReps: isWhole(raw.recentReps, DEADLIFT_LIMITS.recentReps) ? raw.recentReps : null,
    recentRir: pickId(RIR_OPTIONS, raw.recentRir, d.recentRir),
    knownOneRmKg: inRange(raw.knownOneRmKg, DEADLIFT_LIMITS.weightKg) ? raw.knownOneRmKg : null,
    displayUnit: raw.displayUnit === 'lb' ? 'lb' : 'kg',
    barKg: [15, 20, 25].includes(raw.barKg) ? raw.barKg : d.barKg,
    plates: cleanPlates(raw.plates),
    trapBarAvailable: Boolean(raw.trapBarAvailable),
    painNow: Boolean(raw.painNow),
    limitationNote: typeof raw.limitationNote === 'string' ? raw.limitationNote.slice(0, 200) : '',
    split: pickId(SPLITS, raw.split, d.split),
    deadliftWeekday: isWhole(raw.deadliftWeekday, { min: 0, max: 6 }) ? raw.deadliftWeekday : d.deadliftWeekday,
    frequency: pickId(FREQUENCIES, raw.frequency, d.frequency),
    working: {
      weightKg: inRange(working.weightKg, DEADLIFT_LIMITS.weightKg) ? working.weightKg : d.working.weightKg,
      sets: isWhole(working.sets, DEADLIFT_LIMITS.workingSets) ? working.sets : d.working.sets,
      reps: isWhole(working.reps, DEADLIFT_LIMITS.workingReps) ? working.reps : d.working.reps,
      restSeconds: isWhole(working.restSeconds, DEADLIFT_LIMITS.restSeconds) ? working.restSeconds : d.working.restSeconds,
      targetRpe: typeof working.targetRpe === 'string' && working.targetRpe.length <= 5 ? working.targetRpe : d.working.targetRpe,
    },
    warmups: warmups ? warmups.slice(0, DEADLIFT_LIMITS.maxWarmups) : structuredCloneSafe(d.warmups),
    accessories: accessories ?? structuredCloneSafe(d.accessories),
    reducedVolume: Boolean(raw.reducedVolume),
  };
  if (value.variation === 'trapBar' && !value.trapBarAvailable) value.variation = 'conventional';
  return { value, isClean: true };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function isValidSessionShape(raw) {
  return (
    isPlainObject(raw) &&
    typeof raw.id === 'string' &&
    raw.id.length > 0 &&
    Number.isFinite(raw.startedAt) &&
    DEADLIFT_VARIATIONS.some((variation) => variation.id === raw.variation)
  );
}

export function sanitizeDeadliftSession(raw) {
  if (raw === undefined || raw === null) return { value: null, isClean: true };
  if (!isValidSessionShape(raw)) return { value: null, isClean: false };
  const warmups = cleanSets(raw.warmups, { allowFlags: true });
  const working = cleanSets(raw.working, { allowFlags: true });
  if (!working || working.length === 0) return { value: null, isClean: false };
  const checklist = {};
  if (isPlainObject(raw.checklist)) for (const [key, value] of Object.entries(raw.checklist)) checklist[key] = Boolean(value);
  return {
    value: {
      id: raw.id,
      startedAt: raw.startedAt,
      variation: raw.variation,
      type: raw.type === 'light' ? 'light' : 'heavy',
      restSeconds: isWhole(raw.restSeconds, DEADLIFT_LIMITS.restSeconds) ? raw.restSeconds : 240,
      targetRpe: typeof raw.targetRpe === 'string' ? raw.targetRpe.slice(0, 5) : '5-6',
      warmups: (warmups ?? []).map((set) => ({ weightKg: set.weightKg, reps: set.reps, done: set.done })),
      working: working.map((set) => ({ ...set, rpe: set.rpe ?? null })),
      accessories: cleanAccessories(raw.accessories, true) ?? [],
      checklist,
      notes: typeof raw.notes === 'string' ? raw.notes.slice(0, DEADLIFT_LIMITS.notesLength) : '',
      technique: TECHNIQUE_OPTIONS.some((option) => option.id === raw.technique) ? raw.technique : null,
    },
    isClean: true,
  };
}

export function sanitizeDeadliftHistory(raw) {
  if (raw === undefined) return { value: [], isClean: true };
  if (!Array.isArray(raw)) return { value: [], isClean: false };
  const value = [];
  for (const record of raw) {
    const session = sanitizeDeadliftSession(record).value;
    if (!session || !isValidDateKey(record.dateKey) || !Number.isFinite(record.finishedAt)) continue;
    value.push({
      ...session,
      dateKey: record.dateKey,
      finishedAt: Math.max(record.finishedAt, session.startedAt),
      stopReason: STOP_REASONS.some((reason) => reason.id === record.stopReason) ? record.stopReason : null,
      topSetKg: inRange(record.topSetKg, { min: 0, max: 500 }) ? record.topSetKg : null,
      e1rmKg: inRange(record.e1rmKg, { min: 0, max: 700 }) ? record.e1rmKg : null,
    });
  }
  value.sort((a, b) => b.finishedAt - a.finishedAt);
  return { value: value.slice(0, DEADLIFT_LIMITS.maxHistory), isClean: value.length === raw.length };
}
