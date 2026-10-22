// Pure functions for custom workout days and in-progress sessions. No React, no storage —
// AppStateContext wraps these, and scripts/check.mjs tests them directly.
import { createDefaultEntry, getDayExercises, getExerciseById, getPlanDay, toEntry } from '../data/workouts';

export const ENTRY_LIMITS = {
  sets: { min: 1, max: 10 },
  warmupSets: { min: 0, max: 5 },
  restSeconds: { min: 15, max: 600, step: 15 },
  repsMaxLength: 20,
  entriesPerDay: 15,
};

// Reps are free text such as "8-12", "10 per leg", "30-45 sec" or "AMRAP".
const REPS_PATTERN = /^[0-9A-Za-z][0-9A-Za-z\s\-–,./]*$/;

function clampInt(value, { min, max }) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

export function isValidReps(text) {
  const value = typeof text === 'string' ? text.trim() : '';
  return value.length > 0 && value.length <= ENTRY_LIMITS.repsMaxLength && REPS_PATTERN.test(value);
}

// ---------- Custom plan days ----------
// customizations: { [planId]: { [dayId]: Entry[] } }. Built-in plans are never modified.

export function getDefaultEntries(planId, dayId) {
  return getDayExercises(getPlanDay(planId, dayId).day).map(toEntry);
}

export function isDayCustomized(customizations, planId, dayId) {
  return Array.isArray(customizations?.[planId]?.[dayId]);
}

export function getDayEntries(customizations, planId, dayId) {
  return isDayCustomized(customizations, planId, dayId)
    ? customizations[planId][dayId]
    : getDefaultEntries(planId, dayId);
}

// Applies `change(entries)` to a day, creating its custom copy from the defaults on first edit.
export function editDay(customizations, planId, dayId, change) {
  if (!getPlanDay(planId, dayId).day) return customizations;
  const current = getDayEntries(customizations, planId, dayId);
  const next = change(current);
  if (next === current) return customizations;
  return { ...customizations, [planId]: { ...customizations?.[planId], [dayId]: next } };
}

export function resetDay(customizations, planId, dayId) {
  if (!isDayCustomized(customizations, planId, dayId)) return customizations;
  const otherDays = { ...customizations[planId] };
  delete otherDays[dayId];
  const next = { ...customizations };
  if (Object.keys(otherDays).length > 0) next[planId] = otherDays;
  else delete next[planId];
  return next;
}

export function changeEntry(entries, exerciseId, changes) {
  const index = entries.findIndex((item) => item.exerciseId === exerciseId);
  if (index === -1) return entries;
  const current = entries[index];
  const updated = {
    ...current,
    sets: changes.sets === undefined ? current.sets : clampInt(changes.sets, ENTRY_LIMITS.sets),
    warmupSets:
      changes.warmupSets === undefined ? current.warmupSets : clampInt(changes.warmupSets, ENTRY_LIMITS.warmupSets),
    restSeconds:
      changes.restSeconds === undefined ? current.restSeconds : clampInt(changes.restSeconds, ENTRY_LIMITS.restSeconds),
    reps: changes.reps === undefined || !isValidReps(changes.reps) ? current.reps : changes.reps.trim(),
  };
  const unchanged = ['sets', 'warmupSets', 'restSeconds', 'reps'].every((key) => updated[key] === current[key]);
  if (unchanged) return entries;
  return entries.map((item, i) => (i === index ? updated : item));
}

// Returns the same array (no change) for unknown exercises, duplicates or a full day.
export function addEntry(entries, exerciseId) {
  if (entries.some((item) => item.exerciseId === exerciseId)) return entries;
  if (entries.length >= ENTRY_LIMITS.entriesPerDay) return entries;
  const newEntry = createDefaultEntry(exerciseId);
  return newEntry ? [...entries, newEntry] : entries;
}

export function removeEntry(entries, exerciseId) {
  const next = entries.filter((item) => item.exerciseId !== exerciseId);
  return next.length === entries.length ? entries : next;
}

export function moveEntry(entries, exerciseId, direction) {
  const index = entries.findIndex((item) => item.exerciseId === exerciseId);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= entries.length) return entries;
  const next = [...entries];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// ---------- In-progress sessions ----------
// The session keeps its own copy of the day's entries, so editing the plan mid-workout
// never changes a session that has already started.

export function createActiveSession(planId, dayId, entries, now) {
  return { planId, dayId, startedAt: now, entries, completedExerciseIds: [], setsDone: {} };
}

function findSessionEntry(session, exerciseId) {
  return session?.entries?.find((item) => item.exerciseId === exerciseId) ?? null;
}

// Sets how many working sets are done. An exercise counts as completed once all its sets are done.
export function setSetsDone(session, exerciseId, count) {
  const sessionEntry = findSessionEntry(session, exerciseId);
  if (!sessionEntry) return session;
  const done = clampInt(count, { min: 0, max: sessionEntry.sets });
  const isComplete = done >= sessionEntry.sets;
  const others = session.completedExerciseIds.filter((id) => id !== exerciseId);
  return {
    ...session,
    setsDone: { ...session.setsDone, [exerciseId]: done },
    completedExerciseIds: isComplete ? [...others, exerciseId] : others,
  };
}

// Ticking an exercise marks all its sets done; unticking clears them.
export function toggleExerciseComplete(session, exerciseId) {
  const sessionEntry = findSessionEntry(session, exerciseId);
  if (!sessionEntry) return session;
  const isComplete = session.completedExerciseIds.includes(exerciseId);
  return setSetsDone(session, exerciseId, isComplete ? 0 : sessionEntry.sets);
}

export function getSessionProgress(session) {
  const entries = session?.entries ?? [];
  const totalSets = entries.reduce((sum, item) => sum + item.sets, 0);
  const completedSets = entries.reduce(
    (sum, item) => sum + Math.min(item.sets, session.setsDone?.[item.exerciseId] ?? 0),
    0,
  );
  const completedExercises = entries.filter((item) => session.completedExerciseIds.includes(item.exerciseId)).length;
  return { totalExercises: entries.length, completedExercises, totalSets, completedSets };
}

export function buildSessionRecord(session, { id, finishedAt, dateKey, dayTitle }) {
  const exerciseIds = session.entries.map((item) => item.exerciseId).filter((exerciseId) => getExerciseById(exerciseId));
  const progress = getSessionProgress(session);
  return {
    id,
    planId: session.planId,
    dayId: session.dayId,
    dayTitle,
    dateKey,
    startedAt: session.startedAt,
    finishedAt: Math.max(finishedAt, session.startedAt),
    exerciseIds,
    completedExerciseIds: session.completedExerciseIds.filter((exerciseId) => exerciseIds.includes(exerciseId)),
    totalExercises: exerciseIds.length,
    totalSets: progress.totalSets,
    completedSets: progress.completedSets,
  };
}
