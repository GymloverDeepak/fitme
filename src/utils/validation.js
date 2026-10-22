import { cmToUnit, kgToUnit, unitToCm, unitToKg } from './units';

export const WEIGHT_LIMITS_KG = { min: 20, max: 300 };
export const MEASUREMENT_LIMITS_CM = { min: 10, max: 250 };

export const MEASUREMENT_FIELDS = [
  { id: 'chest', label: 'Chest' },
  { id: 'waist', label: 'Waist' },
  { id: 'arm', label: 'Upper arm' },
  { id: 'thigh', label: 'Thigh' },
];

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// Accepts "72", "72.5" or "72,5". Returns NaN for anything else (negative numbers, letters, "1e3"…).
export function parseDecimal(text) {
  if (typeof text !== 'string') return NaN;
  const normalized = text.trim().replace(',', '.');
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(normalized)) return NaN;
  return Number(normalized);
}

// Returns { kg, error }. Exactly one of them is null.
export function validateWeight(text, unit) {
  if (typeof text !== 'string' || text.trim() === '') {
    return { kg: null, error: 'Enter your body weight.' };
  }
  const value = parseDecimal(text);
  if (Number.isNaN(value)) {
    return { kg: null, error: 'Use numbers only, for example 72.5.' };
  }
  const kg = unitToKg(value, unit);
  if (kg < WEIGHT_LIMITS_KG.min || kg > WEIGHT_LIMITS_KG.max) {
    const min = Math.ceil(kgToUnit(WEIGHT_LIMITS_KG.min, unit));
    const max = Math.floor(kgToUnit(WEIGHT_LIMITS_KG.max, unit));
    return { kg: null, error: `Enter a weight between ${min} and ${max} ${unit}.` };
  }
  return { kg: roundTo(kg, 2), error: null };
}

// fields: { chest: '98', waist: '', … } in the chosen unit.
// Returns { valuesCm, errors, formError }. Empty fields are allowed, but at least one must be filled.
export function validateMeasurements(fields, unit) {
  const valuesCm = {};
  const errors = {};
  const min = Math.ceil(cmToUnit(MEASUREMENT_LIMITS_CM.min, unit));
  const max = Math.floor(cmToUnit(MEASUREMENT_LIMITS_CM.max, unit));
  let filledCount = 0;

  for (const field of MEASUREMENT_FIELDS) {
    const text = typeof fields?.[field.id] === 'string' ? fields[field.id].trim() : '';
    if (text === '') continue;
    filledCount += 1;
    const value = parseDecimal(text);
    if (Number.isNaN(value)) {
      errors[field.id] = 'Use numbers only.';
      continue;
    }
    const cm = unitToCm(value, unit);
    if (cm < MEASUREMENT_LIMITS_CM.min || cm > MEASUREMENT_LIMITS_CM.max) {
      errors[field.id] = `Enter ${min}–${max} ${unit}.`;
      continue;
    }
    valuesCm[field.id] = roundTo(cm, 2);
  }

  const formError = filledCount === 0 ? 'Fill in at least one measurement.' : null;
  return { valuesCm, errors, formError };
}

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
