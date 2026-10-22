// FITME offline checks: data integrity and pure logic (validation, storage repair, dates).
// Run with: npm run check
import assert from 'node:assert/strict';

import {
  DIET_GOALS,
  DIET_PREFERENCES,
  FOODS,
  MEALS,
  getDayNutrition,
  getMealsFor,
} from '../src/data/dietPlans.js';
import { DEFAULT_DEADLIFT_PLAN } from '../src/data/deadlift.js';
import { DEMOS, getDemo } from '../src/data/exerciseDemos.js';
import {
  addWorkingSet,
  buildDeadliftRecord,
  computeProgress,
  createDeadliftSession,
  estimateOneRm,
  plateBreakdown,
  recommendNext,
  recoveryStatus,
  removeWorkingSet,
  roundDownToPlates,
  sanitizeDeadliftHistory,
  sanitizeDeadliftPlan,
  sanitizeDeadliftSession,
  scheduleWarnings,
  suggestPlan,
  updateSessionSet,
} from '../src/storage/deadliftLogic.js';
import { kgToUnit, unitToKg } from '../src/utils/units.js';
import { FITNESS_TIPS, MOTIVATION_QUOTES, getDailyItem } from '../src/data/tips.js';
import { buildArrow, buildFrame } from '../src/utils/pose.js';
import {
  EQUIPMENT_TYPES,
  EXERCISES,
  MUSCLE_GROUPS,
  WORKOUT_PLANS,
  filterExercises,
  getDayExercises,
  getEquipmentTypes,
  getScheduledDay,
} from '../src/data/workouts.js';
import {
  DEFAULT_SETTINGS,
  sanitizeActiveSession,
  sanitizeMeasurements,
  sanitizePlanCustomizations,
  sanitizeSessions,
  sanitizeSettings,
  sanitizeWater,
  sanitizeWeights,
} from '../src/storage/sanitize.js';
import {
  addEntry,
  buildSessionRecord,
  changeEntry,
  createActiveSession,
  editDay,
  getDayEntries,
  getSessionProgress,
  isDayCustomized,
  moveEntry,
  removeEntry,
  resetDay,
  setSetsDone,
  toggleExerciseComplete,
} from '../src/storage/workoutLogic.js';
import { formatDuration, formatTimer, getRecentDateKeys, getStartOfWeek, isValidDateKey, toDateKey } from '../src/utils/date.js';
import { validateMeasurements, validateWeight } from '../src/utils/validation.js';

let passed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures.push(`${name}\n    ${error.message}`);
  }
}

// ---------- Workout data ----------
test('exercise IDs and names are unique (no duplicate entries)', () => {
  const ids = EXERCISES.map((exercise) => exercise.id);
  assert.equal(new Set(ids).size, ids.length);
  const names = EXERCISES.map((exercise) => exercise.name.toLowerCase());
  assert.equal(new Set(names).size, names.length);
});

test('every exercise has complete information', () => {
  const muscles = new Set(MUSCLE_GROUPS.map((group) => group.id));
  const levels = new Set(['beginner', 'intermediate', 'advanced']);
  for (const exercise of EXERCISES) {
    assert.ok(muscles.has(exercise.muscle), `${exercise.id}: unknown muscle`);
    assert.ok(exercise.name && exercise.equipment && exercise.reps, `${exercise.id}: missing text field`);
    assert.ok(Number.isInteger(exercise.sets) && exercise.sets >= 1 && exercise.sets <= 5, `${exercise.id}: sets`);
    assert.ok(exercise.restSeconds >= 30 && exercise.restSeconds <= 300, `${exercise.id}: rest`);
    assert.ok(exercise.instructions.length >= 2, `${exercise.id}: instructions`);
    assert.ok(exercise.safety.length > 10, `${exercise.id}: safety`);
    assert.ok(exercise.levels.length > 0 && exercise.levels.every((level) => levels.has(level)), `${exercise.id}: levels`);
    assert.ok(['compound', 'isolation'].includes(exercise.type), `${exercise.id}: type`);
    assert.ok(Array.isArray(exercise.secondaryMuscles), `${exercise.id}: secondaryMuscles`);
    assert.equal(typeof exercise.needsSpotter, 'boolean', `${exercise.id}: needsSpotter`);
    const equipment = getEquipmentTypes(exercise);
    assert.ok(equipment.length > 0 && equipment.every((id) => EQUIPMENT_TYPES.some((type) => type.id === id)), exercise.id);
  }
});

test('all 8 muscle groups exist and have at least 4 exercises', () => {
  assert.deepEqual(
    MUSCLE_GROUPS.map((group) => group.name),
    ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs & Glutes', 'Core & Abs', 'Compound & Variations'],
  );
  for (const group of MUSCLE_GROUPS) {
    const count = EXERCISES.filter((exercise) => exercise.muscle === group.id).length;
    assert.ok(count >= 4, `${group.id} has ${count}`);
  }
});

test('original plans are preserved and three advanced plans were added', () => {
  assert.deepEqual(
    WORKOUT_PLANS.map((plan) => [plan.id, plan.level, plan.daysPerWeek]),
    [
      ['beginner-3', 'Beginner', 3],
      ['beginner-4', 'Beginner', 4],
      ['intermediate-4', 'Intermediate', 4],
      ['intermediate-6', 'Intermediate', 6],
      ['advanced-ppl-6', 'Advanced', 6],
      ['advanced-ul-4', 'Advanced', 4],
      ['advanced-bro-5', 'Advanced', 5],
    ],
  );
  const ul = WORKOUT_PLANS.find((plan) => plan.id === 'advanced-ul-4');
  assert.deepEqual(ul.schedule.map(Boolean), [true, true, false, true, true, false, false]);
});

// The exact advanced list requested, mapped to library IDs (existing exercises reused, not duplicated).
const REQUESTED_ADVANCED = {
  chest: ['chest-barbell-bench-press', 'chest-incline-barbell-bench', 'chest-weighted-dip', 'chest-incline-db-press', 'chest-cable-crossover', 'chest-paused-bench', 'chest-db-fly', 'chest-machine-press'],
  back: ['back-weighted-pull-up', 'back-barbell-row', 'back-pendlay-row', 'back-t-bar-row', 'back-chest-supported-row', 'back-lat-pulldown', 'back-rack-pull', 'back-straight-arm-pulldown'],
  shoulders: ['shoulders-barbell-ohp', 'shoulders-db-press', 'shoulders-lateral-raise', 'shoulders-cable-lateral-raise', 'shoulders-reverse-pec-deck', 'shoulders-face-pull', 'shoulders-arnold-press'],
  biceps: ['biceps-barbell-curl', 'biceps-ez-preacher-curl', 'biceps-incline-db-curl', 'biceps-hammer-curl', 'biceps-cable-curl', 'biceps-concentration-curl'],
  triceps: ['triceps-close-grip-bench', 'triceps-pushdown', 'triceps-overhead-cable-extension', 'triceps-skull-crusher', 'triceps-parallel-bar-dip'],
  legs: ['legs-back-squat', 'legs-front-squat', 'legs-romanian-deadlift', 'legs-bulgarian-split-squat', 'legs-leg-press', 'legs-hack-squat', 'legs-hip-thrust', 'legs-leg-curl', 'legs-leg-extension', 'legs-calf-raise'],
  core: ['core-hanging-leg-raise', 'core-cable-crunch', 'core-ab-wheel', 'core-weighted-decline-situp', 'core-pallof-press'],
  compound: ['compound-conventional-deadlift', 'compound-sumo-deadlift', 'compound-paused-squat', 'compound-tempo-bench', 'compound-weighted-chin-up', 'compound-farmers-carry'],
};

test('Advanced filter returns every requested advanced exercise', () => {
  const advancedIds = new Set(filterExercises({ levelId: 'advanced' }).map((exercise) => exercise.id));
  for (const [muscle, ids] of Object.entries(REQUESTED_ADVANCED)) {
    for (const id of ids) {
      assert.ok(advancedIds.has(id), `${id} missing from Advanced filter`);
      assert.equal(EXERCISES.find((exercise) => exercise.id === id).muscle, muscle, `${id} muscle`);
    }
  }
  // Advanced-only exercises must not leak into the beginner filter.
  assert.ok(!filterExercises({ levelId: 'beginner' }).some((exercise) => exercise.id === 'compound-sumo-deadlift'));
});

test('search and filters', () => {
  assert.deepEqual(filterExercises({ query: 'bench incline' }).map((e) => e.id).sort(), ['chest-incline-barbell-bench']);
  assert.ok(filterExercises({ query: 'CURL' }).length >= 7);
  assert.equal(filterExercises({ query: 'zzz' }).length, 0);
  assert.ok(filterExercises({ equipmentId: 'cable' }).every((e) => getEquipmentTypes(e).includes('cable')));
  assert.ok(filterExercises({ equipmentId: 'machine' }).some((e) => e.id === 'legs-hack-squat'));
  assert.ok(!getEquipmentTypes(EXERCISES.find((e) => e.id === 'core-cable-crunch')).includes('machine'));
  const combined = filterExercises({ query: 'squat', muscleId: 'legs', levelId: 'advanced', equipmentId: 'barbell' });
  assert.deepEqual(combined.map((e) => e.id).sort(), ['legs-back-squat', 'legs-front-squat']);
});

const weeklyVolume = {};
test('plan schedules and day references are valid', () => {
  for (const plan of WORKOUT_PLANS) {
    assert.equal(plan.schedule.length, 7, `${plan.id}: schedule length`);
    const trainingDays = plan.schedule.filter(Boolean);
    assert.equal(trainingDays.length, plan.daysPerWeek, `${plan.id}: daysPerWeek`);
    assert.ok(plan.schedule.includes(null), `${plan.id}: needs at least one rest day`);
    const dayIds = new Set(plan.days.map((day) => day.id));
    for (const dayId of trainingDays) assert.ok(dayIds.has(dayId), `${plan.id}: unknown day ${dayId}`);

    const volume = {};
    for (const dayId of trainingDays) {
      const day = plan.days.find((item) => item.id === dayId);
      const resolved = getDayExercises(day);
      assert.equal(resolved.length, day.exercises.length, `${day.id}: unresolved exercise ID`);
      assert.ok(resolved.length >= 4 && resolved.length <= 8, `${day.id}: ${resolved.length} exercises`);
      const totalSets = resolved.reduce((sum, exercise) => sum + exercise.sets, 0);
      assert.ok(totalSets <= 24, `${day.id}: ${totalSets} sets in one session is too many`);
      for (const exercise of resolved) volume[exercise.muscle] = (volume[exercise.muscle] ?? 0) + exercise.sets;
    }
    for (const [muscle, sets] of Object.entries(volume)) {
      // "legs" groups quads, hamstrings, glutes and calves, so it gets a combined limit.
      const limit = muscle === 'legs' ? 36 : 22;
      assert.ok(sets <= limit, `${plan.id}: ${sets} weekly sets for ${muscle}`);
    }
    weeklyVolume[plan.id] = volume;
  }
});

test('getScheduledDay falls back safely for an unknown plan', () => {
  const result = getScheduledDay('does-not-exist', new Date(2026, 9, 19)); // a Monday
  assert.equal(result.plan.id, 'beginner-3');
  assert.equal(result.weekdayName, 'Monday');
  assert.equal(result.day.id, 'b3-a');
  assert.equal(getScheduledDay('beginner-3', new Date(2026, 9, 25)).day, null); // Sunday rest
});

// ---------- Diet data ----------
const dayTotals = {};
test('every goal and preference has 4 meals with known foods', () => {
  for (const goal of DIET_GOALS) {
    for (const preference of DIET_PREFERENCES) {
      const meals = getMealsFor(goal.id, preference.id);
      assert.deepEqual(
        meals.map((meal) => meal.category),
        ['breakfast', 'lunch', 'eveningSnack', 'dinner'],
        `${goal.id}/${preference.id}`,
      );
      dayTotals[`${goal.id}/${preference.id}`] = getDayNutrition(meals);
    }
  }
  for (const meal of MEALS) {
    for (const item of meal.items) {
      assert.ok(FOODS[item.foodId], `${meal.id}: unknown food ${item.foodId}`);
      assert.ok(item.servings > 0 && item.portion, `${meal.id}: bad item`);
    }
  }
});

test('vegetarian meals contain no meat or eggs', () => {
  const nonVegFoods = new Set(['egg', 'eggWhite', 'chicken']);
  for (const meal of MEALS.filter((item) => item.preference === 'veg')) {
    for (const item of meal.items) assert.ok(!nonVegFoods.has(item.foodId), `${meal.id} contains ${item.foodId}`);
  }
});

test('daily estimates avoid extreme restriction', () => {
  for (const [key, total] of Object.entries(dayTotals)) {
    // Totals exclude oil and "varies" items, so the real day is higher than this.
    assert.ok(total.calories >= 1400, `${key}: only ${total.calories} kcal estimated`);
    assert.ok(total.calories <= 3000, `${key}: ${total.calories} kcal estimated`);
  }
});

// ---------- Validation ----------
test('weight validation', () => {
  assert.equal(validateWeight('72.5', 'kg').kg, 72.5);
  assert.equal(validateWeight('72,5', 'kg').kg, 72.5);
  assert.ok(validateWeight('', 'kg').error);
  assert.ok(validateWeight('abc', 'kg').error);
  assert.ok(validateWeight('-70', 'kg').error);
  assert.ok(validateWeight('1e2', 'kg').error);
  assert.ok(validateWeight('10', 'kg').error);
  assert.ok(validateWeight('500', 'kg').error);
  assert.ok(Math.abs(validateWeight('160', 'lb').kg - 72.57) < 0.01);
  assert.ok(validateWeight('700', 'lb').error);
});

test('measurement validation', () => {
  assert.equal(validateMeasurements({ chest: '', waist: '' }, 'cm').formError, 'Fill in at least one measurement.');
  const ok = validateMeasurements({ chest: '100', waist: '', arm: '35.5', thigh: '' }, 'cm');
  assert.deepEqual(ok.valuesCm, { chest: 100, arm: 35.5 });
  assert.deepEqual(ok.errors, {});
  const bad = validateMeasurements({ chest: '5', waist: 'x' }, 'cm');
  assert.ok(bad.errors.chest && bad.errors.waist);
  assert.equal(validateMeasurements({ waist: '32' }, 'in').valuesCm.waist, 81.28);
});

// ---------- Storage repair ----------
test('missing data gives defaults without reporting a problem', () => {
  assert.deepEqual(sanitizeSettings(undefined), { value: DEFAULT_SETTINGS, isClean: true });
  assert.deepEqual(sanitizeSessions(undefined), { value: [], isClean: true });
  assert.deepEqual(sanitizeActiveSession(null), { value: null, isClean: true });
});

test('malformed data is repaired and reported', () => {
  assert.equal(sanitizeSettings('nonsense').isClean, false);
  assert.equal(sanitizeSettings({ planId: 'gone', weightUnit: 'stone' }).value.planId, 'beginner-3');
  assert.equal(sanitizeSettings({ planId: 'gone', weightUnit: 'stone' }).value.weightUnit, 'kg');
  assert.equal(sanitizeSettings({ planId: 'gone' }).isClean, false);
  assert.equal(sanitizeSettings({ waterGoalGlasses: 99 }).value.waterGoalGlasses, 8);

  const water = sanitizeWater({ '2026-10-20': 5, '2026-13-01': 3, bad: 2, '2026-10-21': -1 });
  assert.deepEqual(water.value, { '2026-10-20': 5 });
  assert.equal(water.isClean, false);

  const sessions = sanitizeSessions([{ id: 'x' }, 42]);
  assert.deepEqual(sessions.value, []);
  assert.equal(sessions.isClean, false);

  assert.equal(sanitizeActiveSession({ planId: 'gone', dayId: 'x', startedAt: 1, completedExerciseIds: [] }).value, null);
  const weights = sanitizeWeights([
    { id: 'a', date: '2026-10-01', kg: 70 },
    { id: 'b', date: '2026-10-02', kg: 5000 },
  ]);
  assert.equal(weights.value.length, 1);
  assert.equal(sanitizeMeasurements([{ id: 'a', date: '2026-10-01', chest: 'big' }]).value.length, 0);
});

test('valid stored data survives a round trip unchanged', () => {
  const session = {
    id: 's1',
    planId: 'beginner-3',
    dayId: 'b3-a',
    dayTitle: 'Full Body A',
    dateKey: '2026-10-19',
    startedAt: 1000,
    finishedAt: 2000,
    completedExerciseIds: ['legs-goblet-squat'],
    totalExercises: 5,
  };
  const restored = sanitizeSessions(JSON.parse(JSON.stringify([session])));
  assert.deepEqual(restored, { value: [session], isClean: true });
  const settings = { ...DEFAULT_SETTINGS, planId: 'intermediate-6', dietPreference: 'nonVeg', weightUnit: 'lb' };
  assert.deepEqual(sanitizeSettings(JSON.parse(JSON.stringify(settings))), { value: settings, isClean: true });
});

// ---------- Custom plans ----------
test('editing a day never changes the built-in plan', () => {
  const before = JSON.stringify(WORKOUT_PLANS);
  let custom = {};
  assert.equal(isDayCustomized(custom, 'advanced-ppl-6', 'apl-push-a'), false);
  custom = editDay(custom, 'advanced-ppl-6', 'apl-push-a', (e) => changeEntry(e, 'chest-barbell-bench-press', { sets: 5, reps: '3-5', restSeconds: 240, warmupSets: 4 }));
  const bench = getDayEntries(custom, 'advanced-ppl-6', 'apl-push-a')[0];
  assert.deepEqual(bench, { exerciseId: 'chest-barbell-bench-press', sets: 5, reps: '3-5', restSeconds: 240, warmupSets: 4 });
  assert.equal(JSON.stringify(WORKOUT_PLANS), before);
  assert.equal(getDayEntries({}, 'advanced-ppl-6', 'apl-push-a')[0].sets, 4);
  assert.equal(resetDay(custom, 'advanced-ppl-6', 'apl-push-a')['advanced-ppl-6'], undefined);
});

test('add / remove / move / clamp entries', () => {
  const start = getDayEntries({}, 'beginner-3', 'b3-a');
  const added = addEntry(start, 'compound-farmers-carry');
  assert.equal(added.length, start.length + 1);
  assert.equal(added.at(-1).warmupSets, 1); // compounds get one warm-up set by default
  assert.equal(addEntry(added, 'compound-farmers-carry'), added); // no duplicates
  assert.equal(addEntry(start, 'not-real'), start);
  assert.equal(removeEntry(added, 'compound-farmers-carry').length, start.length);
  assert.equal(moveEntry(start, start[1].exerciseId, -1)[0].exerciseId, start[1].exerciseId);
  assert.equal(moveEntry(start, start[0].exerciseId, -1), start);
  const clamped = changeEntry(start, start[0].exerciseId, { sets: 99, restSeconds: 1, warmupSets: -3, reps: '<script>' });
  assert.deepEqual([clamped[0].sets, clamped[0].restSeconds, clamped[0].warmupSets, clamped[0].reps], [10, 15, 0, start[0].reps]);
});

test('custom plans survive a save/load round trip; bad data is dropped', () => {
  const custom = editDay({}, 'advanced-ul-4', 'aul-upper-1', (e) => addEntry(e, 'core-ab-wheel'));
  assert.deepEqual(sanitizePlanCustomizations(JSON.parse(JSON.stringify(custom))), { value: custom, isClean: true });
  const messy = { 'advanced-ul-4': { 'aul-upper-1': [{ exerciseId: 'core-ab-wheel', sets: 3, reps: '8', restSeconds: 60 }, { exerciseId: 'core-ab-wheel', sets: 3, reps: '8', restSeconds: 60 }, { exerciseId: 'nope' }], 'no-day': [] }, 'no-plan': {} };
  const result = sanitizePlanCustomizations(messy);
  assert.equal(result.isClean, false);
  assert.deepEqual(result.value, { 'advanced-ul-4': { 'aul-upper-1': [{ exerciseId: 'core-ab-wheel', sets: 3, reps: '8', restSeconds: 60, warmupSets: 0 }] } });
});

// ---------- Set tracking ----------
test('completing sets completes the exercise and is saved in history', () => {
  const entries = getDayEntries({}, 'advanced-ppl-6', 'apl-push-a');
  let session = createActiveSession('advanced-ppl-6', 'apl-push-a', entries, 1000);
  session = setSetsDone(session, 'chest-barbell-bench-press', 3);
  assert.equal(session.completedExerciseIds.length, 0);
  session = setSetsDone(session, 'chest-barbell-bench-press', 4);
  assert.deepEqual(session.completedExerciseIds, ['chest-barbell-bench-press']);
  session = setSetsDone(session, 'chest-barbell-bench-press', 2);
  assert.deepEqual(session.completedExerciseIds, []);
  session = toggleExerciseComplete(session, 'shoulders-barbell-ohp');
  assert.equal(session.setsDone['shoulders-barbell-ohp'], 3);
  assert.equal(setSetsDone(session, 'chest-barbell-bench-press', 99).setsDone['chest-barbell-bench-press'], 4);
  const progress = getSessionProgress(session);
  assert.deepEqual([progress.completedSets, progress.completedExercises, progress.totalExercises], [5, 1, 6]);
  const record = buildSessionRecord(session, { id: 'r1', finishedAt: 5000, dateKey: '2026-10-22', dayTitle: 'Push' });
  assert.deepEqual(sanitizeSessions([record]), { value: [record], isClean: true });
  assert.equal(record.completedSets, 5);
});

test('older saved active sessions are migrated without losing progress', () => {
  const old = { planId: 'beginner-3', dayId: 'b3-a', startedAt: 1000, completedExerciseIds: ['legs-goblet-squat'] };
  const { value, isClean } = sanitizeActiveSession(old);
  assert.equal(isClean, true);
  assert.equal(value.entries.length, 5);
  assert.deepEqual(value.completedExerciseIds, ['legs-goblet-squat']);
  assert.equal(value.setsDone['legs-goblet-squat'], 3);
  // A saved session keeps its own (customised) entries.
  const session = createActiveSession('beginner-3', 'b3-a', addEntry(getDayEntries({}, 'beginner-3', 'b3-a'), 'core-ab-wheel'), 1000);
  assert.equal(sanitizeActiveSession(JSON.parse(JSON.stringify(session))).value.entries.length, 6);
});

// ---------- Exercise demonstrations ----------
test('every exercise has its own demonstration that draws inside the frame', () => {
  const missing = EXERCISES.filter((exercise) => !DEMOS[exercise.id]).map((exercise) => exercise.id);
  assert.deepEqual(missing, [], `no demo: ${missing.join(', ')}`);
  const unknown = Object.keys(DEMOS).filter((id) => !EXERCISES.some((exercise) => exercise.id === id));
  assert.deepEqual(unknown, [], `demo for unknown exercise: ${unknown.join(', ')}`);
  for (const [id, demo] of Object.entries(DEMOS)) {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      for (const prim of buildFrame(demo, t)) {
        const points = prim.kind === 'line' ? [prim.a, prim.b] : [prim.c];
        for (const [x, y] of points) {
          assert.ok(Number.isFinite(x) && Number.isFinite(y), `${id}: non-finite point at t=${t}`);
          assert.ok(x >= -4 && x <= 104 && y >= -4 && y <= 104, `${id}: point (${x.toFixed(1)}, ${y.toFixed(1)}) outside frame at t=${t}`);
        }
      }
    }
    // A moving demo must actually move; a hold demo is allowed to stay still.
    if (!demo.hold) assert.ok(buildArrow(demo).length > 0, `${id}: start and end look the same`);
  }
});

test('missing demonstrations fall back to null (placeholder)', () => {
  assert.equal(getDemo('not-a-real-exercise'), null);
  assert.ok(getDemo('compound-farmers-carry'));
});

// ---------- Deadlift planner ----------
test('strength estimate is conservative and only uses reliable sets', () => {
  // 180 kg × 3 with 0–1 reps in reserve → Brzycki (≈193.4) is lower than Epley (≈201).
  const est = estimateOneRm({ weightKg: 180, reps: 3, rir: 0.5 });
  assert.equal(est.value, 193.4);
  assert.ok(est.epley > est.brzycki);
  assert.equal(estimateOneRm({ weightKg: 100, reps: 12, rir: 0 }).value, null); // too many reps
  assert.equal(estimateOneRm({ weightKg: null, reps: 3, rir: 0 }).value, null); // missing value
  assert.equal(estimateOneRm({ weightKg: 5, reps: 3, rir: 0 }).value, null); // below 20 kg
});

test('your profile reproduces the conservative 130 kg × 3 × 3 session and warm-ups', () => {
  const suggestion = suggestPlan(DEFAULT_DEADLIFT_PLAN);
  assert.equal(suggestion.mode, 'advanced');
  assert.deepEqual(suggestion.working, { weightKg: 130, sets: 3, reps: 3, restSeconds: 240, targetRpe: '5-6' });
  assert.deepEqual(suggestion.warmups, [
    { weightKg: 60, reps: 5 },
    { weightKg: 90, reps: 3 },
    { weightKg: 110, reps: 2 },
    { weightKg: 120, reps: 1 },
  ]);
  assert.deepEqual(DEFAULT_DEADLIFT_PLAN.warmups, suggestion.warmups);
});

test('beginner, missing data and pain all get light, technique-focused plans', () => {
  const beginner = suggestPlan({ ...DEFAULT_DEADLIFT_PLAN, experience: 'beginner' });
  assert.equal(beginner.mode, 'technique');
  assert.ok(beginner.working.weightKg <= 100);
  const noData = suggestPlan({ ...DEFAULT_DEADLIFT_PLAN, recentWeightKg: null, recentReps: null });
  assert.equal(noData.mode, 'technique');
  assert.equal(noData.working.weightKg, 40); // bar + 20 kg
  assert.ok(noData.notes.some((note) => note.includes('coach')));
  const pain = suggestPlan({ ...DEFAULT_DEADLIFT_PLAN, painNow: true });
  assert.equal(pain.mode, 'pain');
  assert.ok(pain.working.weightKg < 100);
});

test('plate rounding and breakdown', () => {
  const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
  assert.equal(roundDownToPlates(131.9, 20, plates), 130); // 2.5 kg jumps from a 20 kg bar, always down
  assert.equal(roundDownToPlates(129.9, 20, plates), 127.5);
  assert.equal(roundDownToPlates(139, 20, [25, 10, 5]), 130); // smallest jump 10 kg
  assert.equal(roundDownToPlates(10, 20, plates), 20); // never below the bar
  assert.deepEqual(plateBreakdown(130, 20, plates), { perSide: [25, 25, 5], achievedKg: 130, exact: true });
  assert.deepEqual(plateBreakdown(130, 20, [20, 10, 5]).perSide, [20, 20, 10, 5]);
  assert.equal(plateBreakdown(131, 20, [25, 20, 10, 5]).exact, false);
});

test('kg ↔ lb conversion round trip', () => {
  assert.ok(Math.abs(kgToUnit(130, 'lb') - 286.6) < 0.1);
  assert.ok(Math.abs(unitToKg(kgToUnit(130, 'lb'), 'lb') - 130) < 1e-9);
});

test('sessions never raise the weight automatically; increases are only suggested', () => {
  const plan = { ...DEFAULT_DEADLIFT_PLAN };
  let session = createDeadliftSession(plan, { id: 's1', now: 1000 });
  assert.deepEqual(session.working.map((set) => set.weightKg), [130, 130, 130]);
  assert.equal(session.warmups.length, 4);
  for (let i = 0; i < 3; i += 1) session = updateSessionSet(session, 'working', i, { done: true, rpe: 6 });
  session = { ...session, technique: 'good' };
  const record = buildDeadliftRecord(session, { finishedAt: 5000, dateKey: '2026-10-20' });
  assert.equal(record.topSetKg, 130);
  assert.ok(record.e1rmKg > 140 && record.e1rmKg < 160); // 130 × 3 @ RPE 6 (4 in reserve)
  // One good session: repeat. Two good sessions: suggest +2.5 kg — but the plan itself is unchanged.
  assert.equal(recommendNext([record], plan).action, 'repeat');
  const twice = recommendNext([{ ...record, id: 's2' }, record], plan);
  assert.equal(twice.action, 'increase');
  assert.equal(twice.suggestedWeightKg, 132.5);
  assert.equal(plan.working.weightKg, 130);
  // Hard or incomplete sessions suggest reducing; pain suggests stopping heavy work.
  const hard = { ...record, working: record.working.map((set) => ({ ...set, rpe: 9 })) };
  assert.equal(recommendNext([hard], plan).action, 'reduce');
  assert.equal(recommendNext([{ ...record, stopReason: 'pain' }], plan).action, 'stop');
});

test('reduced volume, light days and input limits', () => {
  const reduced = createDeadliftSession({ ...DEFAULT_DEADLIFT_PLAN, reducedVolume: true }, { id: 'r', now: 1 });
  assert.equal(reduced.working.length, 2);
  const light = createDeadliftSession(DEFAULT_DEADLIFT_PLAN, { id: 'l', now: 1, type: 'light' });
  assert.equal(light.working[0].weightKg, 102.5); // 80% of 130 = 104, rounded down to buildable 102.5
  let session = createDeadliftSession(DEFAULT_DEADLIFT_PLAN, { id: 'x', now: 1 });
  session = updateSessionSet(session, 'working', 0, { weightKg: -5, reps: 99, rpe: 42 });
  assert.deepEqual([session.working[0].weightKg, session.working[0].reps, session.working[0].rpe], [130, 3, null]);
  assert.equal(updateSessionSet(session, 'working', 9, { done: true }), session);
  assert.equal(removeWorkingSet(removeWorkingSet(removeWorkingSet(session))).working.length, 1);
  assert.equal(addWorkingSet(session).working.length, 4);
});

test('recovery and schedule warnings', () => {
  const now = Date.UTC(2026, 9, 22, 12);
  const recent = [{ type: 'heavy', finishedAt: now - 30 * 3600000 }];
  assert.equal(recoveryStatus({ deadliftHistory: recent, sessions: [], now }).level, 'warning');
  assert.equal(recoveryStatus({ deadliftHistory: [{ type: 'heavy', finishedAt: now - 60 * 3600000 }], sessions: [], now }).level, 'caution');
  const squatSession = { finishedAt: now - 20 * 3600000, completedExerciseIds: ['legs-back-squat'] };
  assert.equal(recoveryStatus({ deadliftHistory: [], sessions: [squatSession], now }).level, 'warning');
  assert.equal(recoveryStatus({ deadliftHistory: [], sessions: [], now }).level, 'none');
  // PPL: Friday (Pull B) sits before Saturday (Legs B, no heavy hinge) → fine; Tuesday is before Legs A (RDL) → warning.
  assert.deepEqual(scheduleWarnings({ ...DEFAULT_DEADLIFT_PLAN, deadliftWeekday: 4 }), []);
  assert.equal(scheduleWarnings({ ...DEFAULT_DEADLIFT_PLAN, deadliftWeekday: 1 }).length, 1);
});

test('deadlift data survives save/load and bad data is handled', () => {
  const plan = sanitizeDeadliftPlan(JSON.parse(JSON.stringify(DEFAULT_DEADLIFT_PLAN)));
  assert.deepEqual(plan, { value: DEFAULT_DEADLIFT_PLAN, isClean: true });
  assert.equal(sanitizeDeadliftPlan(undefined).value.working.weightKg, 130);
  const messy = sanitizeDeadliftPlan({ experience: 'pro', working: { weightKg: 9999 }, plates: ['x'], variation: 'trapBar' });
  assert.deepEqual([messy.value.experience, messy.value.working.weightKg, messy.value.variation], ['advanced', 130, 'conventional']);
  const session = createDeadliftSession(DEFAULT_DEADLIFT_PLAN, { id: 'p', now: 1000 });
  assert.deepEqual(sanitizeDeadliftSession(JSON.parse(JSON.stringify(session))).value, session);
  assert.equal(sanitizeDeadliftSession({ id: 'p' }).value, null);
  const record = buildDeadliftRecord(session, { finishedAt: 2000, dateKey: '2026-10-22' });
  const history = sanitizeDeadliftHistory([record, { junk: true }]);
  assert.equal(history.value.length, 1);
  assert.equal(history.isClean, false);
  const progress = computeProgress([buildDeadliftRecord(updateSessionSet(session, 'working', 0, { done: true, rpe: 6 }), { finishedAt: 3000, dateKey: '2026-10-22' })]);
  assert.equal(progress.heaviestByReps[3].weightKg, 130);
});

// ---------- Dates and formatting ----------
test('date helpers', () => {
  assert.equal(toDateKey(new Date(2026, 0, 5)), '2026-01-05');
  assert.ok(isValidDateKey('2024-02-29'));
  assert.ok(!isValidDateKey('2026-02-29'));
  assert.deepEqual(getRecentDateKeys(3, new Date(2026, 2, 1)), ['2026-03-01', '2026-02-28', '2026-02-27']);
  assert.equal(new Date(getStartOfWeek(new Date(2026, 9, 25))).getDate(), 19); // Sunday → previous Monday
  assert.equal(formatTimer(90), '1:30');
  assert.equal(formatTimer(0), '0:00');
  assert.equal(formatDuration(30), 'Under 1 min');
  assert.equal(formatDuration(3900), '1 h 5 min');
});

test('daily tip rotation is stable and never empty', () => {
  assert.equal(getDailyItem(FITNESS_TIPS, '2026-10-22'), getDailyItem(FITNESS_TIPS, '2026-10-22'));
  assert.notEqual(getDailyItem(FITNESS_TIPS, '2026-10-22'), getDailyItem(FITNESS_TIPS, '2026-10-23'));
  assert.ok(getDailyItem(MOTIVATION_QUOTES, 'garbage'));
  assert.equal(getDailyItem([], '2026-10-22'), '');
});

// ---------- Report ----------
console.log('\nEstimated daily totals (excluding oil and "varies" items):');
for (const [key, total] of Object.entries(dayTotals)) {
  console.log(`  ${key.padEnd(28)} ≈ ${String(total.calories).padStart(4)} kcal  ${String(total.protein).padStart(3)} g protein`);
}
console.log('\nWeekly sets per muscle:');
for (const [planId, volume] of Object.entries(weeklyVolume)) {
  console.log(`  ${planId.padEnd(16)} ${Object.entries(volume).map(([m, s]) => `${m} ${s}`).join(', ')}`);
}

console.log(`\n${passed} checks passed, ${failures.length} failed.`);
if (failures.length) {
  console.error(`\nFailures:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
