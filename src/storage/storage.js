// Thin wrapper around AsyncStorage: local key-value storage on this phone only.
// It is not a database, is not synced between devices and is not a cloud backup.
import AsyncStorage from '@react-native-async-storage/async-storage';

// Versioned keys: if the data format changes, a new version prefix lets us migrate safely
// instead of misreading old data.
const KEY_PREFIX = 'fitme:v1:';

export const STORAGE_KEYS = {
  settings: `${KEY_PREFIX}settings`,
  water: `${KEY_PREFIX}water`,
  sessions: `${KEY_PREFIX}sessions`,
  activeSession: `${KEY_PREFIX}activeSession`,
  weights: `${KEY_PREFIX}weights`,
  measurements: `${KEY_PREFIX}measurements`,
  // Added with the advanced library. Older installs simply have no value yet, so no migration is needed.
  planCustomizations: `${KEY_PREFIX}planCustomizations`,
  // Deadlift planner (added later; older installs simply have no value yet).
  deadliftPlan: `${KEY_PREFIX}deadliftPlan`,
  deadliftSession: `${KEY_PREFIX}deadliftSession`,
  deadliftHistory: `${KEY_PREFIX}deadliftHistory`,
};

const ALL_KEYS = Object.values(STORAGE_KEYS);
const NAME_BY_KEY = Object.fromEntries(Object.entries(STORAGE_KEYS).map(([name, key]) => [key, name]));

// Reads every FITME key in one call.
// Returns { data, unreadable, unavailable }:
//   data        – parsed values by name (missing keys are left undefined)
//   unreadable  – names whose stored text was not valid JSON
//   unavailable – true if storage itself could not be accessed
export async function loadAllData() {
  let pairs;
  try {
    pairs = await AsyncStorage.multiGet(ALL_KEYS);
  } catch (error) {
    console.warn('FITME: could not read local storage', error);
    return { data: {}, unreadable: [], unavailable: true };
  }

  const data = {};
  const unreadable = [];
  for (const [key, rawValue] of pairs) {
    const name = NAME_BY_KEY[key];
    if (!name || rawValue == null) continue;
    try {
      data[name] = JSON.parse(rawValue);
    } catch {
      unreadable.push(name);
    }
  }
  return { data, unreadable, unavailable: false };
}

// Saves an already-serialised JSON string. Returns true on success.
export async function saveJson(key, json) {
  try {
    await AsyncStorage.setItem(key, json);
    return true;
  } catch (error) {
    console.warn(`FITME: could not save ${key}`, error);
    return false;
  }
}

export async function removeAllData() {
  try {
    await AsyncStorage.multiRemove(ALL_KEYS);
    return true;
  } catch (error) {
    console.warn('FITME: could not clear local storage', error);
    return false;
  }
}
