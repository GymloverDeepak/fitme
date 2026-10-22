// Validators for data read back from storage. Stored data may be missing, from an older app version,
// or corrupted, so every value is checked and anything invalid is dropped instead of crashing the app.
// Each function returns { value, isClean } — isClean is false when something had to be discarded.
import { DEFAULT_DIET_GOAL, DEFAULT_DIET_PREFERENCE, DIET_GOALS, DIET_PREFERENCES } from '../data/dietPlans';
import { DEFAULT_PLAN_ID, getExerciseById, getPlanDay, getPlanById } from '../data/workouts';
import { isValidDateKey } from '../utils/date';
import { MEASUREMENT_FIELDS, MEASUREMENT_LIMITS_CM, WEIGHT_LIMITS_KG, isPlainObject } from '../utils/validation';
import { ENTRY_LIMITS, getDefaultEntries, isValidReps } from './workoutLogic';

export const WATER_GOAL_LIMITS = { min: 4, max: 16 };
export const MAX_WATER_GLASSES_PER_DAY = 30;
export const GLASS_SIZE_ML = 250;

const MAX_WATER_DAYS = 120;
const MAX_SESSIONS = 300;
const MAX_WEIGHT_ENTRIES = 365;
const MAX_MEASUREMENT_ENTRIES = 200;

export const DEFAULT_SETTINGS = {
  planId: DEFAULT_PLAN_ID,
  dietGoal: DEFAULT_DIET_GOAL,
  dietPreference: DEFAULT_DIET_PREFERENCE,
  weightUnit: 'kg',
  lengthUnit: 'cm',
  waterGoalGlasses: 8,
};

const isNonEmptyString = (value) => typeof value === 'string' && value.length > 0 && value.length < 200;
const isTimestamp = (value) => Number.isFinite(value) && value > 0;
const isWholeNumberInRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

function pickAllowed(value, allowedIds, fallback) {
  return allowedIds.includes(value) ? value : fallback;
}

export function sanitizeSettings(raw) {
  if (raw === undefined) return { value: { ...DEFAULT_SETTINGS }, isClean: true };
  if (!isPlainObject(raw)) return { value: { ...DEFAULT_SETTINGS }, isClean: false };

  const value = {
    planId: getPlanById(raw.planId) ? raw.planId : DEFAULT_SETTINGS.planId,
    dietGoal: pickAllowed(raw.dietGoal, DIET_GOALS.map((goal) => goal.id), DEFAULT_SETTINGS.dietGoal),
    dietPreference: pickAllowed(
      raw.dietPreference,
      DIET_PREFERENCES.map((preference) => preference.id),
      DEFAULT_SETTINGS.dietPreference,
    ),
    weightUnit: pickAllowed(raw.weightUnit, ['kg', 'lb'], DEFAULT_SETTINGS.weightUnit),
    lengthUnit: pickAllowed(raw.lengthUnit, ['cm', 'in'], DEFAULT_SETTINGS.lengthUnit),
    waterGoalGlasses: isWholeNumberInRange(raw.waterGoalGlasses, WATER_GOAL_LIMITS.min, WATER_GOAL_LIMITS.max)
      ? raw.waterGoalGlasses
      : DEFAULT_SETTINGS.waterGoalGlasses,
  };
  const isClean = Object.keys(value).every((key) => raw[key] === undefined || raw[key] === value[key]);
  return { value, isClean };
}

// { 'YYYY-MM-DD': glasses } — keeps only the most recent days.
export function sanitizeWater(raw) {
  if (raw === undefined) return { value: {}, isClean: true };
  if (!isPlainObject(raw)) return { value: {}, isClean: false };

  const validEntries = Object.entries(raw).filter(
    ([dateKey, glasses]) => isValidDateKey(dateKey) && isWholeNumberInRange(glasses, 0, MAX_WATER_GLASSES_PER_DAY),
  );
  const isClean = validEntries.length === Object.keys(raw).length;
  return { value: pruneWater(Object.fromEntries(validEntries)), isClean };
}

export function pruneWater(water) {
  const keys = Object.keys(water);
  if (keys.length <= MAX_WATER_DAYS) return water;
  const keep = keys.sort().slice(-MAX_WATER_DAYS);
  return Object.fromEntries(keep.map((key) => [key, water[key]]));
}

function isValidSession(session) {
  return (
    isPlainObject(session) &&
    isNonEmptyString(session.id) &&
    isNonEmptyString(session.planId) &&
    isNonEmptyString(session.dayId) &&
    isNonEmptyString(session.dayTitle) &&
    isValidDateKey(session.dateKey) &&
    isTimestamp(session.startedAt) &&
    isTimestamp(session.finishedAt) &&
    session.finishedAt >= session.startedAt &&
    Array.isArray(session.completedExerciseIds) &&
    session.completedExerciseIds.every(isNonEmptyString) &&
    isWholeNumberInRange(session.totalExercises, 0, 100) &&
    // Optional fields added with set tracking; older records simply do not have them.
    (session.exerciseIds === undefined ||
      (Array.isArray(session.exerciseIds) && session.exerciseIds.every(isNonEmptyString))) &&
    (session.totalSets === undefined || isWholeNumberInRange(session.totalSets, 0, 1000)) &&
    (session.completedSets === undefined || isWholeNumberInRange(session.completedSets, 0, 1000))
  );
}

// One exercise entry of a custom day or session. Returns null if it cannot be used.
export function sanitizeEntry(raw) {
  if (!isPlainObject(raw) || !getExerciseById(raw.exerciseId)) return null;
  const { sets, warmupSets, restSeconds } = ENTRY_LIMITS;
  if (!isWholeNumberInRange(raw.sets, sets.min, sets.max)) return null;
  if (!isWholeNumberInRange(raw.restSeconds, restSeconds.min, restSeconds.max)) return null;
  if (!isValidReps(raw.reps)) return null;
  const warmups = raw.warmupSets === undefined ? 0 : raw.warmupSets;
  if (!isWholeNumberInRange(warmups, warmupSets.min, warmupSets.max)) return null;
  return { exerciseId: raw.exerciseId, sets: raw.sets, reps: raw.reps.trim(), restSeconds: raw.restSeconds, warmupSets: warmups };
}

// Valid, de-duplicated entries (max per day). isClean is false if anything was dropped.
export function sanitizeEntries(raw) {
  if (!Array.isArray(raw)) return { value: null, isClean: false };
  const seen = new Set();
  const value = [];
  for (const item of raw) {
    const clean = sanitizeEntry(item);
    if (!clean || seen.has(clean.exerciseId) || value.length >= ENTRY_LIMITS.entriesPerDay) continue;
    seen.add(clean.exerciseId);
    value.push(clean);
  }
  return { value, isClean: value.length === raw.length };
}

// { [planId]: { [dayId]: Entry[] } } — only plans and days that still exist are kept.
export function sanitizePlanCustomizations(raw) {
  if (raw === undefined) return { value: {}, isClean: true };
  if (!isPlainObject(raw)) return { value: {}, isClean: false };
  const value = {};
  let isClean = true;
  for (const [planId, days] of Object.entries(raw)) {
    if (!getPlanById(planId) || !isPlainObject(days)) {
      isClean = false;
      continue;
    }
    for (const [dayId, entries] of Object.entries(days)) {
      const result = sanitizeEntries(entries);
      if (!getPlanDay(planId, dayId).day || result.value === null) {
        isClean = false;
        continue;
      }
      if (!result.isClean) isClean = false;
      value[planId] = { ...value[planId], [dayId]: result.value };
    }
  }
  return { value, isClean };
}

export function sanitizeSessions(raw) {
  if (raw === undefined) return { value: [], isClean: true };
  if (!Array.isArray(raw)) return { value: [], isClean: false };
  const valid = raw.filter(isValidSession);
  valid.sort((a, b) => b.finishedAt - a.finishedAt);
  return { value: valid.slice(0, MAX_SESSIONS), isClean: valid.length === raw.length };
}

export function capSessions(sessions) {
  return sessions.slice(0, MAX_SESSIONS);
}

// An in-progress session must point at a plan day that still exists.
export function sanitizeActiveSession(raw) {
  if (raw === undefined || raw === null) return { value: null, isClean: true };
  const isValid =
    isPlainObject(raw) &&
    isTimestamp(raw.startedAt) &&
    Array.isArray(raw.completedExerciseIds) &&
    raw.completedExerciseIds.every(isNonEmptyString) &&
    getPlanDay(raw.planId, raw.dayId).day !== null;
  if (!isValid) return { value: null, isClean: false };

  // Sessions saved before set tracking have no `entries`: use the day's default exercises (migration).
  const fromStorage = raw.entries === undefined ? null : sanitizeEntries(raw.entries).value;
  const entries = fromStorage && fromStorage.length > 0 ? fromStorage : getDefaultEntries(raw.planId, raw.dayId);
  const entryIds = new Set(entries.map((item) => item.exerciseId));

  const setsDone = {};
  if (isPlainObject(raw.setsDone)) {
    for (const item of entries) {
      const done = raw.setsDone[item.exerciseId];
      if (isWholeNumberInRange(done, 0, item.sets)) setsDone[item.exerciseId] = done;
    }
  }
  const completedExerciseIds = [...new Set(raw.completedExerciseIds)].filter((id) => entryIds.has(id));
  // Older sessions tracked whole exercises only: treat completed ones as all sets done.
  for (const id of completedExerciseIds) {
    if (setsDone[id] === undefined) setsDone[id] = entries.find((item) => item.exerciseId === id).sets;
  }

  return {
    value: { planId: raw.planId, dayId: raw.dayId, startedAt: raw.startedAt, entries, completedExerciseIds, setsDone },
    isClean: fromStorage === null ? raw.entries === undefined : fromStorage.length === raw.entries.length,
  };
}

function sortByDateDesc(entries) {
  return [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function sanitizeWeights(raw) {
  if (raw === undefined) return { value: [], isClean: true };
  if (!Array.isArray(raw)) return { value: [], isClean: false };
  const valid = raw.filter(
    (entry) =>
      isPlainObject(entry) &&
      isNonEmptyString(entry.id) &&
      isValidDateKey(entry.date) &&
      Number.isFinite(entry.kg) &&
      entry.kg >= WEIGHT_LIMITS_KG.min &&
      entry.kg <= WEIGHT_LIMITS_KG.max,
  );
  return {
    value: sortByDateDesc(valid).slice(0, MAX_WEIGHT_ENTRIES),
    isClean: valid.length === raw.length,
  };
}

export function capWeights(entries) {
  return sortByDateDesc(entries).slice(0, MAX_WEIGHT_ENTRIES);
}

function isValidMeasurementValue(value) {
  return Number.isFinite(value) && value >= MEASUREMENT_LIMITS_CM.min && value <= MEASUREMENT_LIMITS_CM.max;
}

export function sanitizeMeasurements(raw) {
  if (raw === undefined) return { value: [], isClean: true };
  if (!Array.isArray(raw)) return { value: [], isClean: false };
  const valid = [];
  for (const entry of raw) {
    if (!isPlainObject(entry) || !isNonEmptyString(entry.id) || !isValidDateKey(entry.date)) continue;
    const clean = { id: entry.id, date: entry.date };
    for (const field of MEASUREMENT_FIELDS) {
      if (isValidMeasurementValue(entry[field.id])) clean[field.id] = entry[field.id];
    }
    if (Object.keys(clean).length > 2) valid.push(clean);
  }
  return {
    value: sortByDateDesc(valid).slice(0, MAX_MEASUREMENT_ENTRIES),
    isClean: valid.length === raw.length,
  };
}

export function capMeasurements(entries) {
  return sortByDateDesc(entries).slice(0, MAX_MEASUREMENT_ENTRIES);
}
