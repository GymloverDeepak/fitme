// Static content and defaults for the Deadlift Training Planner.
// All loads in the planner are suggestions to adjust to readiness and technique — never guarantees.

export const DEADLIFT_VARIATIONS = [
  { id: 'conventional', name: 'Conventional', exerciseId: 'compound-conventional-deadlift' },
  { id: 'sumo', name: 'Sumo', exerciseId: 'compound-sumo-deadlift' },
  { id: 'romanian', name: 'Romanian', exerciseId: 'legs-romanian-deadlift' },
  { id: 'trapBar', name: 'Trap-bar', exerciseId: 'compound-trap-bar-deadlift', needsTrapBar: true },
];

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
];

// How many more reps you could have done. value is used in the strength estimate.
export const RIR_OPTIONS = [
  { id: '0', name: '0 (max effort)', value: 0 },
  { id: '0-1', name: '0–1', value: 0.5 },
  { id: '1-2', name: '1–2', value: 1.5 },
  { id: '2-3', name: '2–3', value: 2.5 },
  { id: '4+', name: '4 or more', value: 4 },
];

export const SPLITS = [
  { id: 'ppl', name: 'Push/Pull/Legs', planId: 'advanced-ppl-6', recommendedWeekday: 4, dayLabel: 'Pull day' },
  { id: 'upperLower', name: 'Upper/Lower', planId: 'advanced-ul-4', recommendedWeekday: 4, dayLabel: 'Lower day' },
  { id: 'bro', name: 'Bro Split', planId: 'advanced-bro-5', recommendedWeekday: 1, dayLabel: 'Back day' },
  { id: 'custom', name: 'Custom', planId: null, recommendedWeekday: null, dayLabel: 'Your chosen day' },
];

export const FREQUENCIES = [
  { id: 'weekly', name: 'Heavy every week' },
  { id: 'alternate', name: 'Heavy / light weeks' },
  { id: 'technique', name: 'Technique only' },
];

export const WEEKDAYS_SHORT = [
  { id: '0', name: 'Mon' },
  { id: '1', name: 'Tue' },
  { id: '2', name: 'Wed' },
  { id: '3', name: 'Thu' },
  { id: '4', name: 'Fri' },
  { id: '5', name: 'Sat' },
  { id: '6', name: 'Sun' },
];

export const BAR_OPTIONS = [
  { id: '20', name: '20 kg bar' },
  { id: '15', name: '15 kg bar' },
  { id: '25', name: '25 kg trap bar' },
];

export const PLATE_SIZES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

export const RPE_OPTIONS = ['5', '6', '7', '8', '9', '10'];

export const TECHNIQUE_OPTIONS = [
  { id: 'good', name: 'Good' },
  { id: 'ok', name: 'Some breakdown' },
  { id: 'poor', name: 'Poor' },
];

export const STOP_REASONS = [
  { id: 'pain', name: 'Pain' },
  { id: 'technique', name: 'Technique broke down' },
  { id: 'fatigue', name: 'Too fatigued' },
  { id: 'heavy', name: 'Warm-ups felt very heavy' },
];

// Optional, moderate accessories after deadlifts. No heavy rack pulls or heavy rows.
export const DEADLIFT_ACCESSORIES = [
  { exerciseId: 'back-chest-supported-row', sets: 2, reps: '8-12', restSeconds: 90 },
  { exerciseId: 'back-lat-pulldown', sets: 2, reps: '8-12', restSeconds: 90 },
  { exerciseId: 'biceps-db-curl', sets: 2, reps: '10-15', restSeconds: 60 },
];

// Exercises that load the lower back / posterior chain heavily (used for recovery warnings).
export const POSTERIOR_CHAIN_IDS = [
  'compound-conventional-deadlift',
  'compound-sumo-deadlift',
  'compound-trap-bar-deadlift',
  'legs-romanian-deadlift',
  'back-rack-pull',
  'legs-back-squat',
  'compound-paused-squat',
  'back-pendlay-row',
  'back-barbell-row',
];

export const PRE_LIFT_CHECKLIST = [
  { id: 'equipment', text: 'Bar, plates and collars checked; lifting area clear and non-slippery.' },
  { id: 'close', text: 'Bar starts over mid-foot and stays close to your body.' },
  { id: 'brace', text: 'Breathe in and brace your trunk before each rep.' },
  { id: 'spine', text: 'Keep a controlled, stable back position — no sudden rounding.' },
  { id: 'push', text: 'Push the floor away; hips and shoulders rise together.' },
  { id: 'lower', text: 'Lower the bar under control — no dropping or bouncing.' },
  { id: 'noMax', text: 'No bouncing reps, grinding, failed reps or uncontrolled max attempts.' },
  { id: 'stop', text: 'Stop the set if technique breaks down or you feel sharp pain, dizziness or anything unusual.' },
];

export const DEADLIFT_SAFETY_NOTICE =
  'All loads are suggestions. Adjust them to how you feel today and to your technique. No weight is guaranteed safe. ' +
  'Stop immediately if you feel pain or your technique breaks down — do not lift through pain.';

export const COACH_NOTICE =
  'Learning the deadlift with a qualified coach is strongly recommended, especially for beginners. ' +
  'A good setup reduces risk but no single back position removes all injury risk.';

export const NO_MAX_NOTICE =
  'This planner never asks for a 1-rep max test. Avoid failed reps, grinding reps and max attempts.';

export const RECOVERY_GUIDANCE_DEADLIFT = [
  'Allow at least 48–72 hours before another demanding posterior-chain session (heavy deadlifts, RDLs, rack pulls, heavy squats or rows).',
  'Take more recovery if fatigue or soreness persists, sleep was poor, or warm-ups feel unusually heavy.',
  'Repeat the same load until technique, effort and recovery are consistently good. Only then consider a small increase such as 2.5 kg.',
  'Not everyone needs to deadlift heavily every week. Heavy/light weeks or technique-only phases are valid choices.',
];

// The user's own starting profile (180 kg × 3 at 0–1 reps in reserve) and the conservative first session.
// Every value is editable in the planner.
export const DEFAULT_DEADLIFT_PLAN = {
  experience: 'advanced',
  variation: 'conventional',
  recentWeightKg: 180,
  recentReps: 3,
  recentRir: '0-1',
  knownOneRmKg: null,
  displayUnit: 'kg',
  barKg: 20,
  plates: [...PLATE_SIZES_KG],
  trapBarAvailable: false,
  painNow: false,
  limitationNote: '',
  split: 'ppl',
  deadliftWeekday: 4,
  frequency: 'weekly',
  working: { weightKg: 130, sets: 3, reps: 3, restSeconds: 240, targetRpe: '5-6' },
  warmups: [
    { weightKg: 60, reps: 5 },
    { weightKg: 90, reps: 3 },
    { weightKg: 110, reps: 2 },
    { weightKg: 120, reps: 1 },
  ],
  accessories: DEADLIFT_ACCESSORIES.map((item) => ({ ...item, enabled: true })),
  reducedVolume: false,
};

export const GENERAL_WARMUP = 'General warm-up: 5 minutes of easy cardio, then hip hinges, glute bridges and a few bodyweight good mornings.';
