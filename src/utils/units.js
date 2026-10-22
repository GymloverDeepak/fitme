// Unit conversion. Values are always stored in kg and cm; these only affect display and input.
export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;

export const WEIGHT_UNITS = [
  { id: 'kg', name: 'Kilograms (kg)' },
  { id: 'lb', name: 'Pounds (lb)' },
];

export const LENGTH_UNITS = [
  { id: 'cm', name: 'Centimetres (cm)' },
  { id: 'in', name: 'Inches (in)' },
];

export function kgToUnit(kg, unit) {
  return unit === 'lb' ? kg / KG_PER_LB : kg;
}

export function unitToKg(value, unit) {
  return unit === 'lb' ? value * KG_PER_LB : value;
}

export function cmToUnit(cm, unit) {
  return unit === 'in' ? cm / CM_PER_INCH : cm;
}

export function unitToCm(value, unit) {
  return unit === 'in' ? value * CM_PER_INCH : value;
}

export function formatWeight(kg, unit) {
  return `${kgToUnit(kg, unit).toFixed(1)} ${unit}`;
}

// Training loads: "130 kg" / "132.5 kg", or "286.6 lb" when lb display is chosen.
export function formatLoad(kg, unit = 'kg') {
  if (!Number.isFinite(kg)) return '—';
  return unit === 'lb' ? `${kgToUnit(kg, 'lb').toFixed(1)} lb` : `${Number(kg.toFixed(2))} kg`;
}

export function formatLength(cm, unit) {
  return `${cmToUnit(cm, unit).toFixed(1)} ${unit}`;
}
