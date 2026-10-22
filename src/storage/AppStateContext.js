// App-wide state for FITME, loaded from and saved to local storage on this device.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getPlanDay, resolveEntries } from '../data/workouts';
import { toDateKey } from '../utils/date';
import {
  DEFAULT_SETTINGS,
  MAX_WATER_GLASSES_PER_DAY,
  capMeasurements,
  capSessions,
  capWeights,
  pruneWater,
  sanitizeActiveSession,
  sanitizeMeasurements,
  sanitizePlanCustomizations,
  sanitizeSessions,
  sanitizeSettings,
  sanitizeWater,
  sanitizeWeights,
} from './sanitize';
import {
  DEADLIFT_LIMITS,
  addWorkingSet,
  buildDeadliftRecord,
  createDeadliftSession,
  removeWorkingSet,
  sanitizeDeadliftHistory,
  sanitizeDeadliftPlan,
  sanitizeDeadliftSession,
  updateAccessory,
  updateSessionSet,
} from './deadliftLogic';
import { STORAGE_KEYS, loadAllData, removeAllData, saveJson } from './storage';
import {
  addEntry,
  buildSessionRecord,
  changeEntry,
  createActiveSession,
  editDay,
  getDayEntries,
  isDayCustomized,
  moveEntry,
  removeEntry,
  resetDay,
  setSetsDone,
  toggleExerciseComplete,
} from './workoutLogic';

const AppStateContext = createContext(null);

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Saves `value` whenever it changes after loading. The first value seen after loading (or after
// clearing data) is treated as already saved, so the app never rewrites data it just read.
function usePersistedValue(key, value, isReady, resetToken, onSaveFailed) {
  const lastSavedRef = useRef(null);
  const tokenRef = useRef(null);

  useEffect(() => {
    if (!isReady) return;
    const json = JSON.stringify(value);
    if (tokenRef.current !== resetToken) {
      tokenRef.current = resetToken;
      lastSavedRef.current = json;
      return;
    }
    if (json === lastSavedRef.current) return;
    lastSavedRef.current = json;
    saveJson(key, json).then((saved) => {
      if (!saved) onSaveFailed();
    });
  }, [key, value, isReady, resetToken, onSaveFailed]);
}

export function AppStateProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  // null | 'unavailable' | 'repaired' | 'saveFailed'
  const [storageIssue, setStorageIssue] = useState(null);
  const [resetToken, setResetToken] = useState(0);
  const [todayKey, setTodayKey] = useState(() => toDateKey());

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [water, setWater] = useState({});
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [weights, setWeights] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [planCustomizations, setPlanCustomizations] = useState({});
  const [deadliftPlan, setDeadliftPlan] = useState(() => sanitizeDeadliftPlan(undefined).value);
  const [deadliftSession, setDeadliftSession] = useState(null);
  const [deadliftHistory, setDeadliftHistory] = useState([]);

  // Load saved data once on start-up.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, unreadable, unavailable } = await loadAllData();
      if (cancelled) return;

      const results = {
        settings: sanitizeSettings(data.settings),
        water: sanitizeWater(data.water),
        sessions: sanitizeSessions(data.sessions),
        activeSession: sanitizeActiveSession(data.activeSession),
        weights: sanitizeWeights(data.weights),
        measurements: sanitizeMeasurements(data.measurements),
        planCustomizations: sanitizePlanCustomizations(data.planCustomizations),
        deadliftPlan: sanitizeDeadliftPlan(data.deadliftPlan),
        deadliftSession: sanitizeDeadliftSession(data.deadliftSession),
        deadliftHistory: sanitizeDeadliftHistory(data.deadliftHistory),
      };
      setSettings(results.settings.value);
      setWater(results.water.value);
      setSessions(results.sessions.value);
      setActiveSession(results.activeSession.value);
      setWeights(results.weights.value);
      setMeasurements(results.measurements.value);
      setPlanCustomizations(results.planCustomizations.value);
      setDeadliftPlan(results.deadliftPlan.value);
      setDeadliftSession(results.deadliftSession.value);
      setDeadliftHistory(results.deadliftHistory.value);

      const anyRepaired = unreadable.length > 0 || Object.values(results).some((result) => !result.isClean);
      if (unavailable) setStorageIssue('unavailable');
      else if (anyRepaired) setStorageIssue('repaired');
      setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep "today" correct if the app stays open past midnight or returns from the background.
  useEffect(() => {
    const refreshToday = () => setTodayKey(toDateKey());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshToday();
    });
    const interval = setInterval(refreshToday, 60 * 1000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const handleSaveFailed = useCallback(() => setStorageIssue('saveFailed'), []);
  usePersistedValue(STORAGE_KEYS.settings, settings, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.water, water, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.sessions, sessions, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.activeSession, activeSession, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.weights, weights, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.measurements, measurements, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.planCustomizations, planCustomizations, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.deadliftPlan, deadliftPlan, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.deadliftSession, deadliftSession, isReady, resetToken, handleSaveFailed);
  usePersistedValue(STORAGE_KEYS.deadliftHistory, deadliftHistory, isReady, resetToken, handleSaveFailed);

  // ---------- Deadlift planner ----------
  // Plan changes are re-validated, so bad input can never be stored.
  const updateDeadliftPlan = useCallback((changes) => {
    setDeadliftPlan((current) => sanitizeDeadliftPlan({ ...current, ...changes }).value);
  }, []);

  const startDeadliftSession = useCallback(
    (type = 'heavy') => {
      setDeadliftSession(createDeadliftSession(deadliftPlan, { id: createId(), now: Date.now(), type }));
    },
    [deadliftPlan],
  );

  const editDeadliftSession = useCallback((change) => {
    setDeadliftSession((current) => (current ? change(current) : current));
  }, []);

  const updateDeadliftSet = useCallback(
    (kind, index, changes) => editDeadliftSession((session) => updateSessionSet(session, kind, index, changes)),
    [editDeadliftSession],
  );
  const addDeadliftSet = useCallback(() => editDeadliftSession(addWorkingSet), [editDeadliftSession]);
  const removeDeadliftSet = useCallback(() => editDeadliftSession(removeWorkingSet), [editDeadliftSession]);
  const updateDeadliftAccessory = useCallback(
    (index, changes) => editDeadliftSession((session) => updateAccessory(session, index, changes)),
    [editDeadliftSession],
  );
  const setDeadliftSessionField = useCallback(
    (field, value) =>
      editDeadliftSession((session) => {
        if (field === 'notes') return { ...session, notes: String(value).slice(0, DEADLIFT_LIMITS.notesLength) };
        if (field === 'technique') return { ...session, technique: value };
        if (field === 'checklist') return { ...session, checklist: { ...session.checklist, ...value } };
        return session;
      }),
    [editDeadliftSession],
  );

  // Saves the session to history. stopReason marks a session ended early (pain, technique, fatigue…).
  const finishDeadliftSession = useCallback(
    (stopReason = null) => {
      if (!deadliftSession) return null;
      const finishedAt = Date.now();
      const record = buildDeadliftRecord(deadliftSession, {
        finishedAt,
        dateKey: toDateKey(new Date(finishedAt)),
        stopReason,
      });
      setDeadliftHistory((current) => [record, ...current].slice(0, DEADLIFT_LIMITS.maxHistory));
      setDeadliftSession(null);
      return record;
    },
    [deadliftSession],
  );

  const discardDeadliftSession = useCallback(() => setDeadliftSession(null), []);

  const deleteDeadliftRecord = useCallback((id) => {
    setDeadliftHistory((current) => current.filter((record) => record.id !== id));
  }, []);

  const updateSettings = useCallback((changes) => {
    setSettings((current) => sanitizeSettings({ ...current, ...changes }).value);
  }, []);

  const changeWater = useCallback(
    (delta) => {
      setWater((current) => {
        const glasses = current[todayKey] ?? 0;
        const next = Math.min(MAX_WATER_GLASSES_PER_DAY, Math.max(0, glasses + delta));
        if (next === glasses) return current;
        return pruneWater({ ...current, [todayKey]: next });
      });
    },
    [todayKey],
  );

  // ---------- Workout days (built-in plan or the user's custom version) ----------
  const getDayExercisesFor = useCallback(
    (planId, dayId) => resolveEntries(getDayEntries(planCustomizations, planId, dayId)),
    [planCustomizations],
  );

  const isDayCustom = useCallback(
    (planId, dayId) => isDayCustomized(planCustomizations, planId, dayId),
    [planCustomizations],
  );

  const updateDayEntry = useCallback((planId, dayId, exerciseId, changes) => {
    setPlanCustomizations((current) =>
      editDay(current, planId, dayId, (entries) => changeEntry(entries, exerciseId, changes)),
    );
  }, []);

  // Returns false when the exercise is already in the day or the day is full.
  const addExerciseToDay = useCallback(
    (planId, dayId, exerciseId) => {
      const entries = getDayEntries(planCustomizations, planId, dayId);
      if (addEntry(entries, exerciseId) === entries) return false;
      setPlanCustomizations((current) => editDay(current, planId, dayId, (list) => addEntry(list, exerciseId)));
      return true;
    },
    [planCustomizations],
  );

  const removeExerciseFromDay = useCallback((planId, dayId, exerciseId) => {
    setPlanCustomizations((current) => editDay(current, planId, dayId, (entries) => removeEntry(entries, exerciseId)));
  }, []);

  const moveExerciseInDay = useCallback((planId, dayId, exerciseId, direction) => {
    setPlanCustomizations((current) =>
      editDay(current, planId, dayId, (entries) => moveEntry(entries, exerciseId, direction)),
    );
  }, []);

  const resetDayToDefault = useCallback((planId, dayId) => {
    setPlanCustomizations((current) => resetDay(current, planId, dayId));
  }, []);

  // ---------- Sessions ----------
  // The session copies the day's current entries, so later plan edits do not affect it.
  const startSession = useCallback(
    (planId, dayId) => {
      if (!getPlanDay(planId, dayId).day) return false;
      const entries = getDayEntries(planCustomizations, planId, dayId);
      if (entries.length === 0) return false;
      setActiveSession(createActiveSession(planId, dayId, entries, Date.now()));
      return true;
    },
    [planCustomizations],
  );

  const toggleSessionExercise = useCallback((exerciseId) => {
    setActiveSession((current) => (current ? toggleExerciseComplete(current, exerciseId) : current));
  }, []);

  const setSessionSetsDone = useCallback((exerciseId, count) => {
    setActiveSession((current) => (current ? setSetsDone(current, exerciseId, count) : current));
  }, []);

  const discardSession = useCallback(() => setActiveSession(null), []);

  // Saves the active session to history and returns the saved record (or null if none was active).
  const finishSession = useCallback(() => {
    if (!activeSession) return null;
    const { day } = getPlanDay(activeSession.planId, activeSession.dayId);
    const finishedAt = Date.now();
    const record = buildSessionRecord(activeSession, {
      id: createId(),
      finishedAt,
      dateKey: toDateKey(new Date(finishedAt)),
      dayTitle: day?.title ?? 'Workout',
    });
    setSessions((current) => capSessions([record, ...current]));
    setActiveSession(null);
    return record;
  }, [activeSession]);

  // One weight entry per day: saving again on the same day replaces it.
  const saveWeight = useCallback(
    (kg) => {
      setWeights((current) =>
        capWeights([{ id: createId(), date: todayKey, kg }, ...current.filter((entry) => entry.date !== todayKey)]),
      );
    },
    [todayKey],
  );

  const deleteWeight = useCallback((id) => {
    setWeights((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const saveMeasurements = useCallback(
    (valuesCm) => {
      setMeasurements((current) =>
        capMeasurements([
          { id: createId(), date: todayKey, ...valuesCm },
          ...current.filter((entry) => entry.date !== todayKey),
        ]),
      );
    },
    [todayKey],
  );

  const deleteMeasurement = useCallback((id) => {
    setMeasurements((current) => current.filter((entry) => entry.id !== id));
  }, []);

  // Removes every FITME key from this device and resets the app to its defaults.
  const clearAllData = useCallback(async () => {
    const removed = await removeAllData();
    setSettings({ ...DEFAULT_SETTINGS });
    setWater({});
    setSessions([]);
    setActiveSession(null);
    setWeights([]);
    setMeasurements([]);
    setPlanCustomizations({});
    setDeadliftPlan(sanitizeDeadliftPlan(undefined).value);
    setDeadliftSession(null);
    setDeadliftHistory([]);
    setResetToken((token) => token + 1);
    setStorageIssue(removed ? null : 'saveFailed');
    return removed;
  }, []);

  const dismissStorageIssue = useCallback(() => setStorageIssue(null), []);

  const value = useMemo(
    () => ({
      isReady,
      storageIssue,
      dismissStorageIssue,
      todayKey,
      settings,
      updateSettings,
      water,
      waterToday: water[todayKey] ?? 0,
      changeWater,
      sessions,
      activeSession,
      startSession,
      toggleSessionExercise,
      setSessionSetsDone,
      finishSession,
      discardSession,
      planCustomizations,
      getDayExercisesFor,
      isDayCustom,
      updateDayEntry,
      addExerciseToDay,
      removeExerciseFromDay,
      moveExerciseInDay,
      resetDayToDefault,
      deadliftPlan,
      updateDeadliftPlan,
      deadliftSession,
      startDeadliftSession,
      updateDeadliftSet,
      addDeadliftSet,
      removeDeadliftSet,
      updateDeadliftAccessory,
      setDeadliftSessionField,
      finishDeadliftSession,
      discardDeadliftSession,
      deadliftHistory,
      deleteDeadliftRecord,
      weights,
      saveWeight,
      deleteWeight,
      measurements,
      saveMeasurements,
      deleteMeasurement,
      clearAllData,
    }),
    [
      deadliftPlan,
      updateDeadliftPlan,
      deadliftSession,
      startDeadliftSession,
      updateDeadliftSet,
      addDeadliftSet,
      removeDeadliftSet,
      updateDeadliftAccessory,
      setDeadliftSessionField,
      finishDeadliftSession,
      discardDeadliftSession,
      deadliftHistory,
      deleteDeadliftRecord,
      isReady,
      storageIssue,
      dismissStorageIssue,
      todayKey,
      settings,
      updateSettings,
      water,
      changeWater,
      sessions,
      activeSession,
      startSession,
      toggleSessionExercise,
      setSessionSetsDone,
      finishSession,
      discardSession,
      planCustomizations,
      getDayExercisesFor,
      isDayCustom,
      updateDayEntry,
      addExerciseToDay,
      removeExerciseFromDay,
      moveExerciseInDay,
      resetDayToDefault,
      weights,
      saveWeight,
      deleteWeight,
      measurements,
      saveMeasurements,
      deleteMeasurement,
      clearAllData,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside <AppStateProvider>.');
  }
  return context;
}
