// Body Mass Index helpers. Pure functions — the BMI screen uses them and scripts/check.mjs tests them.
// BMI = weight (kg) / height (m)². Adult screening categories only; not for children or pregnancy.
import { CM_PER_INCH } from './units';
import { parseDecimal } from './validation';

export const BMI_LIMITS = {
  weightKg: { min: 20, max: 300 },
  heightCm: { min: 100, max: 250 },
  feet: { min: 3, max: 8 },
  inches: { min: 0, max: 11.9 },
};

// Ranges use the BMI rounded to one decimal, matching what the screen shows (24.96 shows as 25.0 → Overweight).
export const BMI_CATEGORIES = [
  { id: 'underweight', name: 'Underweight', range: 'Below 18.5', min: -Infinity, max: 18.5, tone: 'warning' },
  { id: 'healthy', name: 'Healthy weight', range: '18.5–24.9', min: 18.5, max: 25, tone: 'success' },
  { id: 'overweight', name: 'Overweight', range: '25.0–29.9', min: 25, max: 30, tone: 'warning' },
  { id: 'obesity', name: 'Obesity range', range: '30.0 and above', min: 30, max: Infinity, tone: 'error' },
];

export function calculateBmi(weightKg, heightCm) {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) return null;
  const metres = heightCm / 100;
  return weightKg / (metres * metres);
}

export function roundBmi(bmi) {
  return Math.round(bmi * 10) / 10;
}

export function classifyAdultBmi(bmi) {
  if (!Number.isFinite(bmi)) return null;
  const rounded = roundBmi(bmi);
  return BMI_CATEGORIES.find((category) => rounded >= category.min && rounded < category.max) ?? null;
}

export function feetInchesToCm(feet, inches) {
  return (feet * 12 + inches) * CM_PER_INCH;
}

function inRange(value, { min, max }) {
  return Number.isFinite(value) && value >= min && value <= max;
}

// Validates the raw text inputs. heightMode is 'cm' or 'ftin'.
// Returns { weightKg, heightCm, errors } — errors is empty when both values are usable.
export function parseBmiInputs({ weightText, heightMode, cmText, feetText, inchesText }) {
  const errors = {};
  const weightKg = parseDecimal(weightText ?? '');
  if (!String(weightText ?? '').trim()) errors.weight = 'Enter your weight in kg.';
  else if (!inRange(weightKg, BMI_LIMITS.weightKg)) {
    errors.weight = `Enter a weight between ${BMI_LIMITS.weightKg.min} and ${BMI_LIMITS.weightKg.max} kg.`;
  }

  let heightCm = NaN;
  if (heightMode === 'ftin') {
    const feet = parseDecimal(feetText ?? '');
    const inchesRaw = String(inchesText ?? '').trim();
    const inches = inchesRaw === '' ? 0 : parseDecimal(inchesRaw);
    if (!String(feetText ?? '').trim()) errors.height = 'Enter your height in feet.';
    else if (!Number.isInteger(feet) || !inRange(feet, BMI_LIMITS.feet)) {
      errors.height = `Enter whole feet between ${BMI_LIMITS.feet.min} and ${BMI_LIMITS.feet.max}.`;
    } else if (!inRange(inches, BMI_LIMITS.inches)) {
      errors.height = 'Inches must be between 0 and 11.9.';
    } else {
      heightCm = feetInchesToCm(feet, inches);
    }
  } else {
    heightCm = parseDecimal(cmText ?? '');
    if (!String(cmText ?? '').trim()) errors.height = 'Enter your height in cm.';
  }
  if (!errors.height && !inRange(heightCm, BMI_LIMITS.heightCm)) {
    errors.height = `Height must be between ${BMI_LIMITS.heightCm.min} and ${BMI_LIMITS.heightCm.max} cm (about 3 ft 3 in – 8 ft 2 in).`;
  }

  return { weightKg, heightCm, errors };
}
