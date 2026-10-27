// Offline workout library and sample weekly plans for FITME.
// Plans are general examples for healthy adults, not personalised or medical advice.
import { SPECIALTY_EXERCISES, SPECIALTY_PLANS } from './specialtyTraining';

export const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'triceps', name: 'Triceps' },
  { id: 'legs', name: 'Legs & Glutes' },
  { id: 'core', name: 'Core & Abs' },
  { id: 'compound', name: 'Compound & Variations' },
  { id: 'cardio', name: 'Cardio & Conditioning' },
];

// Plan categories shown as a filter on the Workout tab. Original plans are 'strength'.
export const PLAN_CATEGORIES = [
  { id: 'strength', name: 'Strength & muscle' },
  { id: 'hyrox', name: 'HYROX-style' },
  { id: 'crossfit', name: 'CrossFit-style' },
  { id: 'core', name: 'Six-pack abs' },
  { id: 'fat-loss', name: 'Fat loss' },
  { id: 'womens-cardio', name: "Women's cardio" },
  { id: 'prenatal', name: 'Prenatal' },
];

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
];

// Equipment categories for filtering. Each exercise's categories are derived from its equipment text.
export const EQUIPMENT_TYPES = [
  { id: 'barbell', name: 'Barbell' },
  { id: 'dumbbell', name: 'Dumbbell' },
  { id: 'cable', name: 'Cable' },
  { id: 'machine', name: 'Machine' },
  { id: 'bodyweight', name: 'Bodyweight' },
  { id: 'other', name: 'Other' },
];

// The original library. sets / reps / restSeconds are defaults; a plan day may override them.
// Training metadata (levels, type, secondary muscles, spotter) is added from ORIGINAL_METADATA below.
const ORIGINAL_EXERCISES = [
  // Chest
  {
    id: 'chest-barbell-bench-press',
    name: 'Barbell Bench Press',
    muscle: 'chest',
    equipment: 'Barbell, flat bench',
    sets: 3,
    reps: '6-10',
    restSeconds: 150,
    instructions: [
      'Lie with your eyes under the bar, feet flat and shoulder blades pulled together.',
      'Lower the bar with control to your mid-chest, elbows about 45° from your body.',
      'Press back up until your arms are straight, keeping your hips on the bench.',
    ],
    safety: 'Use a spotter or safety bars for heavy sets. Never bounce the bar off your chest.',
  },
  {
    id: 'chest-db-bench-press',
    name: 'Dumbbell Bench Press',
    muscle: 'chest',
    equipment: 'Dumbbells, flat bench',
    sets: 3,
    reps: '8-12',
    restSeconds: 120,
    instructions: [
      'Sit with the dumbbells on your thighs, then lie back and bring them to chest level.',
      'Press the dumbbells up over your chest without clanging them together.',
      'Lower slowly until you feel a stretch across the chest.',
    ],
    safety: 'Choose a weight you can control on the way down. Bring the dumbbells back to your thighs before sitting up.',
  },
  {
    id: 'chest-incline-db-press',
    name: 'Incline Dumbbell Press',
    muscle: 'chest',
    equipment: 'Dumbbells, incline bench (30–45°)',
    sets: 3,
    reps: '8-12',
    restSeconds: 120,
    instructions: [
      'Set the bench to a low incline and keep your back flat against it.',
      'Press the dumbbells up and slightly together over your upper chest.',
      'Lower under control to the sides of your upper chest.',
    ],
    safety: 'A steep bench shifts work to the shoulders. Keep the incline at 45° or lower.',
  },
  {
    id: 'chest-push-up',
    name: 'Push-Up',
    muscle: 'chest',
    equipment: 'Bodyweight',
    sets: 3,
    reps: '8-15',
    restSeconds: 90,
    instructions: [
      'Place your hands slightly wider than your shoulders and keep your body in a straight line.',
      'Lower your chest towards the floor with elbows angled back, not flared out.',
      'Push the floor away until your arms are straight.',
    ],
    safety: 'Do them on your knees or with hands on a bench if you cannot keep your hips from sagging.',
  },
  {
    id: 'chest-db-fly',
    name: 'Dumbbell Fly',
    muscle: 'chest',
    equipment: 'Dumbbells, flat bench',
    sets: 3,
    reps: '10-15',
    restSeconds: 90,
    instructions: [
      'Hold the dumbbells over your chest with a slight bend in your elbows.',
      'Open your arms in a wide arc until you feel a stretch in your chest.',
      'Bring the dumbbells back together as if hugging a large tree.',
    ],
    safety: 'Use light weights and stop the stretch at shoulder level to protect the shoulder joint.',
  },
  {
    id: 'chest-dip',
    name: 'Chest Dip',
    muscle: 'chest',
    equipment: 'Parallel bars',
    sets: 3,
    reps: '6-12',
    restSeconds: 120,
    instructions: [
      'Support yourself on the bars with straight arms and lean your torso slightly forward.',
      'Bend your elbows to lower until your upper arms are about parallel to the floor.',
      'Press back up to straight arms.',
    ],
    safety: 'Skip dips if they cause shoulder pain. Use an assisted machine if you cannot control the descent.',
  },

  // Back
  {
    id: 'back-lat-pulldown',
    name: 'Lat Pulldown',
    muscle: 'back',
    equipment: 'Cable machine',
    sets: 3,
    reps: '8-12',
    restSeconds: 120,
    instructions: [
      'Grip the bar slightly wider than your shoulders and secure your thighs under the pad.',
      'Pull the bar to your upper chest by driving your elbows down.',
      'Let the bar rise slowly until your arms are straight.',
    ],
    safety: 'Do not pull the bar behind your neck. Avoid leaning far back to move the weight.',
  },
  {
    id: 'back-pull-up',
    name: 'Pull-Up',
    muscle: 'back',
    equipment: 'Pull-up bar',
    sets: 3,
    reps: '5-10',
    restSeconds: 150,
    instructions: [
      'Hang from the bar with hands a little wider than your shoulders.',
      'Pull your chest towards the bar by driving your elbows down.',
      'Lower all the way down with control.',
    ],
    safety: 'Use a resistance band or assisted machine until you can do full reps without kicking.',
  },
  {
    id: 'back-barbell-row',
    name: 'Barbell Bent-Over Row',
    muscle: 'back',
    equipment: 'Barbell',
    sets: 3,
    reps: '6-10',
    restSeconds: 150,
    instructions: [
      'Hinge at the hips with a flat back until your torso is about 45° to the floor.',
      'Pull the bar to your lower ribs, squeezing your shoulder blades together.',
      'Lower the bar until your arms are straight while keeping your back position.',
    ],
    safety: 'Keep your back flat throughout. Reduce the weight if your lower back starts to round.',
  },
  {
    id: 'back-seated-cable-row',
    name: 'Seated Cable Row',
    muscle: 'back',
    equipment: 'Cable machine',
    sets: 3,
    reps: '10-12',
    restSeconds: 90,
    instructions: [
      'Sit tall with knees slightly bent and hold the handle with straight arms.',
      'Pull the handle to your stomach while keeping your chest up.',
      'Return slowly until your arms are straight and you feel your back stretch.',
    ],
    safety: 'Avoid rocking your torso back and forth to move the weight.',
  },
  {
    id: 'back-one-arm-db-row',
    name: 'One-Arm Dumbbell Row',
    muscle: 'back',
    equipment: 'Dumbbell, bench',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    instructions: [
      'Place one knee and hand on a bench and keep your back flat.',
      'Row the dumbbell towards your hip, keeping your elbow close to your body.',
      'Lower until your arm is straight. Finish all reps, then switch sides.',
    ],
    safety: 'Keep your torso still and avoid twisting to lift heavier.',
  },

  // Shoulders
  {
    id: 'shoulders-db-press',
    name: 'Seated Dumbbell Shoulder Press',
    muscle: 'shoulders',
    equipment: 'Dumbbells, bench with back support',
    sets: 3,
    reps: '8-12',
    restSeconds: 120,
    instructions: [
      'Sit upright with your back against the pad and dumbbells at shoulder height.',
      'Press the dumbbells overhead until your arms are almost straight.',
      'Lower with control back to shoulder height.',
    ],
    safety: 'Do not arch your lower back. Brace your stomach muscles as you press.',
  },
  {
    id: 'shoulders-barbell-ohp',
    name: 'Standing Barbell Overhead Press',
    muscle: 'shoulders',
    equipment: 'Barbell',
    sets: 3,
    reps: '6-8',
    restSeconds: 150,
    instructions: [
      'Stand with feet hip-width apart and the bar resting on your upper chest.',
      'Brace your core and glutes, then press the bar straight overhead.',
      'Move your head back slightly to let the bar pass, then lower to your chest.',
    ],
    safety: 'Avoid leaning back. Lower the weight if you cannot keep your ribs down.',
  },
  {
    id: 'shoulders-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscle: 'shoulders',
    equipment: 'Dumbbells',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    instructions: [
      'Stand tall holding light dumbbells at your sides with a slight elbow bend.',
      'Raise your arms out to the sides until they reach shoulder height.',
      'Lower slowly over two to three seconds.',
    ],
    safety: 'Use light weights and avoid swinging. Stop at shoulder height.',
  },
  {
    id: 'shoulders-rear-delt-fly',
    name: 'Dumbbell Rear Delt Fly',
    muscle: 'shoulders',
    equipment: 'Dumbbells',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    instructions: [
      'Hinge forward with a flat back and let light dumbbells hang below your chest.',
      'Raise your arms out to the sides, leading with your elbows.',
      'Lower slowly without letting the weights swing.',
    ],
    safety: 'Keep your neck neutral and your back flat. Use a chest-supported bench if your lower back tires.',
  },
  {
    id: 'shoulders-face-pull',
    name: 'Face Pull',
    muscle: 'shoulders',
    equipment: 'Cable machine with rope',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    instructions: [
      'Set the cable at upper-chest height and hold the rope with palms facing down.',
      'Pull the rope towards your face, separating the ends beside your ears.',
      'Return slowly until your arms are straight.',
    ],
    safety: 'Use a light weight and focus on smooth control rather than load.',
  },

  // Biceps
  {
    id: 'biceps-barbell-curl',
    name: 'Barbell Curl',
    muscle: 'biceps',
    equipment: 'Barbell or EZ bar',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    instructions: [
      'Stand tall holding the bar at shoulder width with palms facing forward.',
      'Curl the bar up while keeping your elbows by your sides.',
      'Lower the bar slowly until your arms are straight.',
    ],
    safety: 'Avoid swinging your back. An EZ bar may be more comfortable for your wrists.',
  },
  {
    id: 'biceps-db-curl',
    name: 'Dumbbell Curl',
    muscle: 'biceps',
    equipment: 'Dumbbells',
    sets: 3,
    reps: '10-12',
    restSeconds: 75,
    instructions: [
      'Stand holding dumbbells at your sides with palms facing forward.',
      'Curl both dumbbells up while keeping your upper arms still.',
      'Lower slowly to full arm extension.',
    ],
    safety: 'Keep your wrists straight and avoid leaning back to lift the weight.',
  },
  {
    id: 'biceps-hammer-curl',
    name: 'Hammer Curl',
    muscle: 'biceps',
    equipment: 'Dumbbells',
    sets: 3,
    reps: '10-12',
    restSeconds: 75,
    instructions: [
      'Hold dumbbells at your sides with palms facing each other.',
      'Curl the dumbbells up without rotating your wrists.',
      'Lower slowly until your arms are straight.',
    ],
    safety: 'Keep your elbows close to your body and avoid using momentum.',
  },
  {
    id: 'biceps-incline-db-curl',
    name: 'Incline Dumbbell Curl',
    muscle: 'biceps',
    equipment: 'Dumbbells, incline bench',
    sets: 3,
    reps: '10-12',
    restSeconds: 75,
    instructions: [
      'Sit back on a 45–60° incline bench and let your arms hang straight down.',
      'Curl the dumbbells up while keeping your upper arms still.',
      'Lower slowly into the stretch.',
    ],
    safety: 'Start light. The stretched position puts more stress on the elbow and shoulder.',
  },

  // Triceps
  {
    id: 'triceps-pushdown',
    name: 'Cable Triceps Pushdown',
    muscle: 'triceps',
    equipment: 'Cable machine',
    sets: 3,
    reps: '10-15',
    restSeconds: 75,
    instructions: [
      'Stand facing the cable with elbows tucked at your sides.',
      'Push the handle down until your arms are straight.',
      'Let the handle rise slowly to about chest height without moving your elbows.',
    ],
    safety: 'Keep your shoulders down and avoid leaning over the handle.',
  },
  {
    id: 'triceps-overhead-extension',
    name: 'Overhead Dumbbell Triceps Extension',
    muscle: 'triceps',
    equipment: 'Dumbbell',
    sets: 3,
    reps: '10-12',
    restSeconds: 75,
    instructions: [
      'Hold one dumbbell overhead with both hands, sitting or standing tall.',
      'Lower the dumbbell behind your head by bending your elbows.',
      'Straighten your arms to lift the dumbbell back overhead.',
    ],
    safety: 'Keep your elbows pointing forward and your core braced to protect your lower back.',
  },
  {
    id: 'triceps-close-grip-bench',
    name: 'Close-Grip Bench Press',
    muscle: 'triceps',
    equipment: 'Barbell, flat bench',
    sets: 3,
    reps: '6-10',
    restSeconds: 120,
    instructions: [
      'Lie on the bench and grip the bar about shoulder-width apart.',
      'Lower the bar to your lower chest with elbows close to your body.',
      'Press back up until your arms are straight.',
    ],
    safety: 'A very narrow grip strains the wrists. Use a spotter for heavier sets.',
  },
  {
    id: 'triceps-bench-dip',
    name: 'Bench Dip',
    muscle: 'triceps',
    equipment: 'Bench',
    sets: 3,
    reps: '8-15',
    restSeconds: 75,
    instructions: [
      'Place your hands on the edge of a bench behind you with your legs out in front.',
      'Bend your elbows to lower your hips until your upper arms are near parallel.',
      'Press back up to straight arms.',
    ],
    safety: 'Stop the descent before you feel strain in the front of your shoulders.',
  },

  // Legs
  {
    id: 'legs-back-squat',
    name: 'Barbell Back Squat',
    muscle: 'legs',
    equipment: 'Barbell, squat rack',
    sets: 3,
    reps: '6-10',
    restSeconds: 180,
    instructions: [
      'Rest the bar on your upper back with feet about shoulder-width apart.',
      'Brace your core, then sit down and back until your thighs are about parallel.',
      'Drive through your whole foot to stand up tall.',
    ],
    safety: 'Always set the rack safety bars. Keep your knees moving in line with your toes.',
  },
  {
    id: 'legs-goblet-squat',
    name: 'Goblet Squat',
    muscle: 'legs',
    equipment: 'Dumbbell or kettlebell',
    sets: 3,
    reps: '8-12',
    restSeconds: 120,
    instructions: [
      'Hold a dumbbell vertically against your chest with feet shoulder-width apart.',
      'Squat down between your knees while keeping your chest up.',
      'Stand back up by pushing through your heels and mid-foot.',
    ],
    safety: 'Only squat as deep as you can while keeping your back flat.',
  },
  {
    id: 'legs-romanian-deadlift',
    name: 'Romanian Deadlift',
    muscle: 'legs',
    equipment: 'Barbell or dumbbells',
    sets: 3,
    reps: '8-10',
    restSeconds: 150,
    instructions: [
      'Stand holding the weight in front of your thighs with soft knees.',
      'Push your hips back and slide the weight down your legs until you feel a hamstring stretch.',
      'Drive your hips forward to stand tall.',
    ],
    safety: 'Keep the weight close to your legs and your back flat. Stop when your back starts to round.',
  },
  {
    id: 'legs-leg-press',
    name: 'Leg Press',
    muscle: 'legs',
    equipment: 'Leg press machine',
    sets: 3,
    reps: '10-12',
    restSeconds: 120,
    instructions: [
      'Sit with your back flat against the pad and feet shoulder-width on the platform.',
      'Lower the platform until your knees are bent about 90°.',
      'Press back up without fully locking your knees.',
    ],
    safety: 'Do not let your lower back lift off the seat at the bottom of the movement.',
  },
  {
    id: 'legs-walking-lunge',
    name: 'Walking Lunge',
    muscle: 'legs',
    equipment: 'Dumbbells or bodyweight',
    sets: 3,
    reps: '10 per leg',
    restSeconds: 90,
    instructions: [
      'Step forward and lower until both knees are bent about 90°.',
      'Push through your front foot to bring your back leg forward into the next step.',
      'Keep your torso upright throughout.',
    ],
    safety: 'Start with bodyweight only and make sure you have clear space in front of you.',
  },
  {
    id: 'legs-leg-curl',
    name: 'Seated Leg Curl',
    muscle: 'legs',
    equipment: 'Seated leg curl machine',
    sets: 3,
    reps: '10-12',
    restSeconds: 75,
    instructions: [
      'Adjust the pad so it rests just above your heels.',
      'Curl your heels towards your glutes.',
      'Return slowly to the starting position.',
    ],
    safety: 'Keep your hips pressed into the pad and avoid jerking the weight.',
  },
  {
    id: 'legs-leg-extension',
    name: 'Leg Extension',
    muscle: 'legs',
    equipment: 'Leg extension machine',
    sets: 3,
    reps: '12-15',
    restSeconds: 75,
    instructions: [
      'Sit with your knees lined up with the machine pivot and the pad on your lower shins.',
      'Straighten your legs to lift the pad.',
      'Lower slowly back down.',
    ],
    safety: 'Use a moderate weight. Stop if you feel sharp pain in the knee.',
  },
  {
    id: 'legs-calf-raise',
    name: 'Standing Calf Raise',
    muscle: 'legs',
    equipment: 'Calf raise machine or a step',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    instructions: [
      'Stand with the balls of your feet on the edge of a step or platform.',
      'Rise up onto your toes as high as you can.',
      'Lower your heels slowly below the step for a full stretch.',
    ],
    safety: 'Hold a rail or wall for balance when using a step.',
  },

  // Core
  {
    id: 'core-plank',
    name: 'Plank',
    muscle: 'core',
    equipment: 'Bodyweight',
    sets: 3,
    reps: '30-45 sec',
    restSeconds: 60,
    instructions: [
      'Rest on your forearms and toes with elbows under your shoulders.',
      'Keep a straight line from your head to your heels.',
      'Brace your stomach and breathe steadily for the full hold.',
    ],
    safety: 'Stop when your hips start to sag. Quality matters more than time.',
  },
  {
    id: 'core-side-plank',
    name: 'Side Plank',
    muscle: 'core',
    equipment: 'Bodyweight',
    sets: 2,
    reps: '20-30 sec per side',
    restSeconds: 45,
    instructions: [
      'Lie on your side with your elbow directly under your shoulder.',
      'Lift your hips so your body forms a straight line.',
      'Hold, then switch sides.',
    ],
    safety: 'Bend your bottom knee to make it easier if you cannot hold a straight line.',
  },
  {
    id: 'core-dead-bug',
    name: 'Dead Bug',
    muscle: 'core',
    equipment: 'Bodyweight',
    sets: 3,
    reps: '8 per side',
    restSeconds: 45,
    instructions: [
      'Lie on your back with arms pointing up and knees bent at 90° above your hips.',
      'Slowly lower the opposite arm and leg towards the floor.',
      'Return to the start and repeat on the other side.',
    ],
    safety: 'Keep your lower back pressed gently into the floor the whole time.',
  },
  {
    id: 'core-hanging-knee-raise',
    name: 'Hanging Knee Raise',
    muscle: 'core',
    equipment: 'Pull-up bar',
    sets: 3,
    reps: '10-15',
    restSeconds: 60,
    instructions: [
      'Hang from a bar with straight arms and engaged shoulders.',
      'Raise your knees towards your chest while curling your pelvis up.',
      'Lower your legs slowly without swinging.',
    ],
    safety: 'Avoid swinging. Use captain’s-chair knee raises if your grip gives out first.',
  },
  {
    id: 'core-cable-crunch',
    name: 'Cable Crunch',
    muscle: 'core',
    equipment: 'Cable machine with rope',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    instructions: [
      'Kneel facing a high cable and hold the rope beside your head.',
      'Crunch down by rounding your spine, bringing your elbows towards your thighs.',
      'Return slowly to the start.',
    ],
    safety: 'Move from your abs, not your hips or arms. Start with a light weight.',
  },
];

// levels: which difficulty filters show the exercise. type: compound or isolation.
// needsSpotter: a spotter, safety bars or close supervision is recommended for heavy sets.
const ORIGINAL_METADATA = {
  'chest-barbell-bench-press': { levels: ['intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Triceps', 'Front delts'], needsSpotter: true },
  'chest-db-bench-press': { levels: ['beginner', 'intermediate'], type: 'compound', secondaryMuscles: ['Triceps', 'Front delts'] },
  'chest-incline-db-press': { levels: ['beginner', 'intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Front delts', 'Triceps'] },
  'chest-push-up': { levels: ['beginner', 'intermediate'], type: 'compound', secondaryMuscles: ['Triceps', 'Front delts', 'Core'] },
  'chest-db-fly': { levels: ['intermediate', 'advanced'], type: 'isolation', secondaryMuscles: ['Front delts'] },
  'chest-dip': { levels: ['intermediate'], type: 'compound', secondaryMuscles: ['Triceps', 'Front delts'] },
  'back-lat-pulldown': { levels: ['beginner', 'intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Biceps', 'Rear delts'] },
  'back-pull-up': { levels: ['intermediate'], type: 'compound', secondaryMuscles: ['Biceps', 'Core'] },
  'back-barbell-row': { levels: ['intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Biceps', 'Rear delts', 'Lower back'] },
  'back-seated-cable-row': { levels: ['beginner', 'intermediate'], type: 'compound', secondaryMuscles: ['Biceps', 'Rear delts'] },
  'back-one-arm-db-row': { levels: ['beginner', 'intermediate'], type: 'compound', secondaryMuscles: ['Biceps', 'Rear delts'] },
  'shoulders-db-press': { levels: ['beginner', 'intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Triceps', 'Upper chest'] },
  'shoulders-barbell-ohp': { levels: ['intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Triceps', 'Upper chest', 'Core'] },
  'shoulders-lateral-raise': { levels: ['beginner', 'intermediate', 'advanced'], type: 'isolation', secondaryMuscles: [] },
  'shoulders-rear-delt-fly': { levels: ['intermediate'], type: 'isolation', secondaryMuscles: ['Upper back'] },
  'shoulders-face-pull': { levels: ['intermediate', 'advanced'], type: 'isolation', secondaryMuscles: ['Upper back', 'Rotator cuff'] },
  'biceps-barbell-curl': { levels: ['intermediate', 'advanced'], type: 'isolation', secondaryMuscles: ['Forearms'] },
  'biceps-db-curl': { levels: ['beginner', 'intermediate'], type: 'isolation', secondaryMuscles: ['Forearms'] },
  'biceps-hammer-curl': { levels: ['beginner', 'intermediate', 'advanced'], type: 'isolation', secondaryMuscles: ['Brachioradialis', 'Forearms'] },
  'biceps-incline-db-curl': { levels: ['intermediate', 'advanced'], type: 'isolation', secondaryMuscles: ['Forearms'] },
  'triceps-pushdown': { levels: ['beginner', 'intermediate', 'advanced'], type: 'isolation', secondaryMuscles: [] },
  'triceps-overhead-extension': { levels: ['beginner', 'intermediate'], type: 'isolation', secondaryMuscles: [] },
  'triceps-close-grip-bench': { levels: ['intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Chest', 'Front delts'], needsSpotter: true },
  'triceps-bench-dip': { levels: ['beginner'], type: 'compound', secondaryMuscles: ['Chest', 'Front delts'] },
  'legs-back-squat': { levels: ['intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'], needsSpotter: true },
  'legs-goblet-squat': { levels: ['beginner'], type: 'compound', secondaryMuscles: ['Glutes', 'Core'] },
  'legs-romanian-deadlift': { levels: ['beginner', 'intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Glutes', 'Lower back'] },
  'legs-leg-press': { levels: ['beginner', 'intermediate', 'advanced'], type: 'compound', secondaryMuscles: ['Glutes'] },
  'legs-walking-lunge': { levels: ['beginner', 'intermediate'], type: 'compound', secondaryMuscles: ['Glutes', 'Core'] },
  'legs-leg-curl': { levels: ['beginner', 'intermediate', 'advanced'], type: 'isolation', secondaryMuscles: [] },
  'legs-leg-extension': { levels: ['beginner', 'intermediate', 'advanced'], type: 'isolation', secondaryMuscles: [] },
  'legs-calf-raise': { levels: ['beginner', 'intermediate', 'advanced'], type: 'isolation', secondaryMuscles: [] },
  'core-plank': { levels: ['beginner', 'intermediate'], type: 'isolation', secondaryMuscles: ['Shoulders', 'Glutes'] },
  'core-side-plank': { levels: ['beginner'], type: 'isolation', secondaryMuscles: ['Obliques'] },
  'core-dead-bug': { levels: ['beginner'], type: 'isolation', secondaryMuscles: [] },
  'core-hanging-knee-raise': { levels: ['intermediate'], type: 'isolation', secondaryMuscles: ['Hip flexors', 'Grip'] },
  'core-cable-crunch': { levels: ['intermediate', 'advanced'], type: 'isolation', secondaryMuscles: [] },
};

// Advanced library additions. Exercises already in the original library (e.g. Barbell Bench Press,
// Lat Pulldown, Face Pull) are reused via ORIGINAL_METADATA instead of being duplicated.
const ADVANCED_EXERCISES = [
  // Chest
  {
    id: 'chest-incline-barbell-bench',
    name: 'Incline Barbell Bench Press',
    muscle: 'chest',
    secondaryMuscles: ['Front delts', 'Triceps'],
    levels: ['intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Barbell, incline bench (30–45°)',
    sets: 4,
    reps: '6-8',
    restSeconds: 150,
    needsSpotter: true,
    instructions: [
      'Set the bench to 30–45°, plant your feet and pull your shoulder blades together.',
      'Lower the bar with control to your upper chest, elbows slightly tucked.',
      'Press up and slightly back until the bar is over your shoulders.',
    ],
    safety: 'Use a spotter or safety arms. Keep your hips on the bench and do not bounce the bar.',
  },
  {
    id: 'chest-weighted-dip',
    name: 'Weighted Dips',
    muscle: 'chest',
    secondaryMuscles: ['Triceps', 'Front delts'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Parallel bars, dip belt with plate',
    sets: 3,
    reps: '6-10',
    restSeconds: 150,
    instructions: [
      'Attach a light plate to a dip belt and support yourself on straight arms.',
      'Lean slightly forward and lower until your upper arms are about parallel to the floor.',
      'Press back up to straight arms without swinging.',
    ],
    safety: 'Only add weight once 12+ strict bodyweight dips feel easy. Stop if you feel pain at the front of the shoulder.',
  },
  {
    id: 'chest-cable-crossover',
    name: 'Cable Crossover',
    muscle: 'chest',
    secondaryMuscles: ['Front delts'],
    levels: ['intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'Cable machine (two high pulleys)',
    sets: 3,
    reps: '12-15',
    restSeconds: 75,
    instructions: [
      'Stand in a split stance between two high pulleys with a slight bend in your elbows.',
      'Sweep your hands down and together in front of your lower chest.',
      'Return slowly until you feel a stretch across your chest.',
    ],
    safety: 'Keep the elbow bend fixed. Use a weight you can control without leaning or jerking.',
  },
  {
    id: 'chest-paused-bench',
    name: 'Paused Bench Press',
    muscle: 'chest',
    secondaryMuscles: ['Triceps', 'Front delts'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Barbell, flat bench',
    sets: 3,
    reps: '3-6',
    restSeconds: 180,
    needsSpotter: true,
    instructions: [
      'Set up as for a normal bench press with your shoulder blades pulled together.',
      'Lower the bar to your chest and hold it still for a 1–2 second pause, staying tight.',
      'Press up powerfully without bouncing or losing your arch.',
    ],
    safety: 'Use about 10–15% less weight than your normal bench. Always use a spotter or safety arms.',
  },
  {
    id: 'chest-machine-press',
    name: 'Machine Chest Press',
    muscle: 'chest',
    secondaryMuscles: ['Triceps', 'Front delts'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Chest press machine',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    instructions: [
      'Adjust the seat so the handles line up with your mid-chest.',
      'Press the handles forward until your arms are almost straight.',
      'Return slowly until you feel a stretch, keeping your back on the pad.',
    ],
    safety: 'Keep your shoulder blades against the pad and avoid locking your elbows hard.',
  },

  // Back
  {
    id: 'back-weighted-pull-up',
    name: 'Weighted Pull-Ups',
    muscle: 'back',
    secondaryMuscles: ['Biceps', 'Core', 'Grip'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Pull-up bar, dip belt with plate',
    sets: 4,
    reps: '5-8',
    restSeconds: 180,
    instructions: [
      'Attach weight to a dip belt and hang with hands slightly wider than your shoulders.',
      'Pull your chest towards the bar by driving your elbows down to your sides.',
      'Lower all the way to straight arms under control.',
    ],
    safety: 'Add weight only when you can do 10+ strict bodyweight pull-ups. Avoid kipping with added load.',
  },
  {
    id: 'back-pendlay-row',
    name: 'Pendlay Row',
    muscle: 'back',
    secondaryMuscles: ['Biceps', 'Rear delts', 'Lower back'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Barbell',
    sets: 4,
    reps: '5-8',
    restSeconds: 150,
    instructions: [
      'Hinge until your torso is close to parallel with the floor, bar resting on the floor.',
      'Row the bar explosively to your lower chest while your torso stays still.',
      'Lower the bar back to the floor and reset your back position each rep.',
    ],
    safety: 'Keep your back flat — if your torso rises to lift the bar, the weight is too heavy.',
  },
  {
    id: 'back-t-bar-row',
    name: 'T-Bar Row',
    muscle: 'back',
    secondaryMuscles: ['Biceps', 'Rear delts', 'Lower back'],
    levels: ['intermediate', 'advanced'],
    type: 'compound',
    equipment: 'T-bar row machine or landmine with barbell',
    sets: 3,
    reps: '8-10',
    restSeconds: 120,
    instructions: [
      'Straddle the bar, hinge at the hips with a flat back and grip the handle.',
      'Row the handle to your chest by pulling your elbows back.',
      'Lower until your arms are straight without rounding your back.',
    ],
    safety: 'Keep your knees soft and your back flat. Use a chest-supported version if your lower back tires.',
  },
  {
    id: 'back-chest-supported-row',
    name: 'Chest-Supported Row',
    muscle: 'back',
    secondaryMuscles: ['Biceps', 'Rear delts'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Dumbbells, incline bench',
    sets: 3,
    reps: '8-12',
    restSeconds: 120,
    instructions: [
      'Lie chest-down on a 30–45° incline bench with dumbbells hanging below you.',
      'Row the dumbbells up by driving your elbows back towards your hips.',
      'Lower slowly to a full stretch.',
    ],
    safety: 'Keep your chest on the pad and your neck neutral. Avoid shrugging the weight up.',
  },
  {
    id: 'back-rack-pull',
    name: 'Rack Pull',
    muscle: 'back',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Traps', 'Grip'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Barbell, power rack',
    sets: 3,
    reps: '4-6',
    restSeconds: 180,
    instructions: [
      'Set the bar on the rack pins just below or at knee height.',
      'Brace hard, keep the bar close and drive your hips forward to stand tall.',
      'Lower the bar back to the pins under control.',
    ],
    safety: 'Keep a neutral back and do not lean back at the top. The shorter range allows heavier loads — progress slowly.',
  },
  {
    id: 'back-straight-arm-pulldown',
    name: 'Straight-Arm Pulldown',
    muscle: 'back',
    secondaryMuscles: ['Rear delts', 'Core'],
    levels: ['intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'Cable machine with bar or rope',
    sets: 3,
    reps: '12-15',
    restSeconds: 75,
    instructions: [
      'Stand facing a high pulley, hinge slightly and hold the bar with straight arms.',
      'Sweep the bar down to your thighs by squeezing your lats.',
      'Let the bar rise slowly back to eye level.',
    ],
    safety: 'Keep your arms almost straight and your torso still. Use a moderate weight.',
  },

  // Shoulders
  {
    id: 'shoulders-cable-lateral-raise',
    name: 'Cable Lateral Raise',
    muscle: 'shoulders',
    secondaryMuscles: [],
    levels: ['intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'Cable machine (low pulley)',
    sets: 3,
    reps: '12-15',
    restSeconds: 75,
    instructions: [
      'Stand side-on to a low pulley and hold the handle with the far hand.',
      'Raise your arm out to the side until it reaches shoulder height.',
      'Lower slowly, keeping tension on the cable.',
    ],
    safety: 'Keep your torso still and stop at shoulder height. Light weights work best.',
  },
  {
    id: 'shoulders-reverse-pec-deck',
    name: 'Reverse Pec Deck',
    muscle: 'shoulders',
    secondaryMuscles: ['Upper back'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'Pec deck machine',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    instructions: [
      'Sit facing the pad with the handles set at shoulder height.',
      'Sweep your arms back in a wide arc until they are in line with your body.',
      'Return slowly to the front.',
    ],
    safety: 'Lead with your elbows and avoid shrugging. Use a controlled tempo.',
  },
  {
    id: 'shoulders-arnold-press',
    name: 'Arnold Press',
    muscle: 'shoulders',
    secondaryMuscles: ['Triceps', 'Upper chest'],
    levels: ['intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Dumbbells, bench with back support',
    sets: 3,
    reps: '8-10',
    restSeconds: 120,
    instructions: [
      'Sit tall holding dumbbells in front of your shoulders, palms facing you.',
      'Rotate your palms forward as you press the dumbbells overhead.',
      'Reverse the rotation as you lower back to the start.',
    ],
    safety: 'Use lighter dumbbells than a standard press. Keep your ribs down and back supported.',
  },

  // Biceps
  {
    id: 'biceps-ez-preacher-curl',
    name: 'EZ-Bar Preacher Curl',
    muscle: 'biceps',
    secondaryMuscles: ['Forearms'],
    levels: ['intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'EZ bar, preacher bench',
    sets: 3,
    reps: '8-12',
    restSeconds: 75,
    instructions: [
      'Sit at the preacher bench with your upper arms flat on the pad.',
      'Curl the EZ bar up until your forearms are nearly vertical.',
      'Lower slowly until your arms are almost straight.',
    ],
    safety: 'Do not drop into a fully locked, bouncing bottom position — it stresses the elbow.',
  },
  {
    id: 'biceps-cable-curl',
    name: 'Cable Curl',
    muscle: 'biceps',
    secondaryMuscles: ['Forearms'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'Cable machine (low pulley) with bar',
    sets: 3,
    reps: '10-15',
    restSeconds: 75,
    instructions: [
      'Stand facing a low pulley holding the bar with palms up.',
      'Curl the bar up while keeping your elbows by your sides.',
      'Lower slowly to full arm extension.',
    ],
    safety: 'Stand tall and avoid leaning back to finish the rep.',
  },
  {
    id: 'biceps-concentration-curl',
    name: 'Concentration Curl',
    muscle: 'biceps',
    secondaryMuscles: ['Forearms'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'Dumbbell, bench',
    sets: 2,
    reps: '10-15',
    restSeconds: 60,
    instructions: [
      'Sit on a bench and rest the back of your upper arm against your inner thigh.',
      'Curl the dumbbell towards your shoulder.',
      'Lower slowly until your arm is straight. Finish all reps, then switch arms.',
    ],
    safety: 'Keep your upper arm still against your thigh and use a controlled tempo.',
  },

  // Triceps
  {
    id: 'triceps-overhead-cable-extension',
    name: 'Overhead Cable Triceps Extension',
    muscle: 'triceps',
    secondaryMuscles: [],
    levels: ['intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'Cable machine with rope',
    sets: 3,
    reps: '10-12',
    restSeconds: 75,
    instructions: [
      'Face away from the pulley holding the rope behind your head, elbows pointing forward.',
      'Extend your arms forward and up until they are straight.',
      'Bend your elbows slowly to return behind your head.',
    ],
    safety: 'Brace your core in a split stance and keep your elbows from flaring wide.',
  },
  {
    id: 'triceps-skull-crusher',
    name: 'Skull Crushers',
    muscle: 'triceps',
    secondaryMuscles: [],
    levels: ['intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'EZ bar, flat bench',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    needsSpotter: true,
    instructions: [
      'Lie on a bench holding an EZ bar above your chest with straight arms.',
      'Bend your elbows to lower the bar towards your forehead or just behind your head.',
      'Straighten your arms to lift the bar back up.',
    ],
    safety: 'Lower slowly and keep your elbows pointing up. Have a spotter or use light weights when training close to failure.',
  },
  {
    id: 'triceps-parallel-bar-dip',
    name: 'Dips (Assisted or Bodyweight)',
    muscle: 'triceps',
    secondaryMuscles: ['Chest', 'Front delts'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Parallel bars or assisted dip machine',
    sets: 3,
    reps: '6-12',
    restSeconds: 120,
    instructions: [
      'Support yourself on straight arms with your torso upright to focus on the triceps.',
      'Bend your elbows to lower until your upper arms are about parallel to the floor.',
      'Press back up to straight arms.',
    ],
    safety: 'Use the assisted machine or a band if you cannot do full, controlled reps. Stop if your shoulders hurt.',
  },

  // Legs & glutes
  {
    id: 'legs-front-squat',
    name: 'Front Squat',
    muscle: 'legs',
    secondaryMuscles: ['Glutes', 'Upper back', 'Core'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Barbell, squat rack',
    sets: 4,
    reps: '5-8',
    restSeconds: 180,
    needsSpotter: true,
    instructions: [
      'Rest the bar on the front of your shoulders with elbows pointing forward and high.',
      'Brace and squat straight down, keeping your torso upright.',
      'Drive up through your whole foot while keeping your elbows high.',
    ],
    safety: 'Set the rack safety bars. If your elbows drop, the bar will roll forward — lower the weight.',
  },
  {
    id: 'legs-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscle: 'legs',
    secondaryMuscles: ['Glutes', 'Core'],
    levels: ['intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Dumbbells, bench',
    sets: 3,
    reps: '8-10 per leg',
    restSeconds: 120,
    instructions: [
      'Stand a stride in front of a bench and rest the top of your back foot on it.',
      'Lower straight down until your front thigh is about parallel to the floor.',
      'Drive through your front foot to stand back up. Finish all reps, then switch legs.',
    ],
    safety: 'Start with bodyweight to find your balance. Keep your front knee moving in line with your toes.',
  },
  {
    id: 'legs-hack-squat',
    name: 'Hack Squat',
    muscle: 'legs',
    secondaryMuscles: ['Glutes'],
    levels: ['intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Hack squat machine',
    sets: 3,
    reps: '8-10',
    restSeconds: 150,
    instructions: [
      'Stand on the platform with your back and shoulders against the pads.',
      'Release the safeties and lower until your thighs are at least parallel to the platform.',
      'Press back up without locking your knees hard.',
    ],
    safety: 'Always re-engage the machine safeties before stepping out. Keep your back flat on the pad.',
  },
  {
    id: 'legs-hip-thrust',
    name: 'Barbell Hip Thrust',
    muscle: 'legs',
    secondaryMuscles: ['Hamstrings', 'Core'],
    levels: ['intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Barbell with pad, bench',
    sets: 3,
    reps: '8-12',
    restSeconds: 120,
    instructions: [
      'Sit with your upper back against a bench and a padded bar over your hips.',
      'Drive through your heels to lift your hips until your body is straight from shoulders to knees.',
      'Squeeze your glutes at the top, then lower under control.',
    ],
    safety: 'Keep your chin tucked and ribs down — do not over-arch your lower back at the top.',
  },

  // Core & abs
  {
    id: 'core-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscle: 'core',
    secondaryMuscles: ['Hip flexors', 'Grip'],
    levels: ['advanced'],
    type: 'isolation',
    equipment: 'Pull-up bar',
    sets: 3,
    reps: '8-15',
    restSeconds: 75,
    instructions: [
      'Hang from a bar with straight arms and your shoulders engaged.',
      'Keep your legs straight and raise them to at least hip height, curling your pelvis up.',
      'Lower slowly without swinging.',
    ],
    safety: 'Master hanging knee raises first. Stop the swing between reps before starting the next one.',
  },
  {
    id: 'core-ab-wheel',
    name: 'Ab Wheel Rollout',
    muscle: 'core',
    secondaryMuscles: ['Lats', 'Shoulders'],
    levels: ['advanced'],
    type: 'isolation',
    equipment: 'Ab wheel',
    sets: 3,
    reps: '8-12',
    restSeconds: 75,
    instructions: [
      'Kneel holding the wheel under your shoulders with your core braced.',
      'Roll forward slowly, keeping your hips in line with your body.',
      'Pull back to the start using your abs, not your hips.',
    ],
    safety: 'Only roll as far as you can without your lower back sagging. Start with short rollouts.',
  },
  {
    id: 'core-weighted-decline-situp',
    name: 'Weighted Decline Sit-Up',
    muscle: 'core',
    secondaryMuscles: ['Hip flexors'],
    levels: ['advanced'],
    type: 'isolation',
    equipment: 'Decline bench, weight plate',
    sets: 3,
    reps: '8-12',
    restSeconds: 75,
    instructions: [
      'Hook your feet on a decline bench and hold a plate against your chest.',
      'Curl your torso up towards your knees.',
      'Lower slowly until your shoulder blades almost touch the bench.',
    ],
    safety: 'Do not yank on your neck. Use a gentle decline and a light plate first.',
  },
  {
    id: 'core-pallof-press',
    name: 'Pallof Press',
    muscle: 'core',
    secondaryMuscles: ['Obliques', 'Shoulders'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'isolation',
    equipment: 'Cable machine or resistance band',
    sets: 3,
    reps: '10-12 per side',
    restSeconds: 60,
    instructions: [
      'Stand side-on to a cable at chest height, holding the handle at your chest.',
      'Press the handle straight out in front of you without letting your torso rotate.',
      'Hold for a second, bring it back to your chest, then switch sides.',
    ],
    safety: 'Keep your hips and shoulders square. Choose a weight you can resist without twisting.',
  },

  // Compound & variations
  {
    id: 'compound-conventional-deadlift',
    name: 'Conventional Deadlift',
    muscle: 'compound',
    primaryFocus: 'Posterior chain (glutes, hamstrings, back)',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Lower back', 'Traps', 'Grip'],
    levels: ['intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Barbell',
    sets: 3,
    reps: '3-5',
    restSeconds: 180,
    instructions: [
      'Stand with the bar over mid-foot, grip just outside your legs and pull the slack out of the bar.',
      'Brace, keep your back flat and push the floor away until you stand tall.',
      'Lower by pushing your hips back, keeping the bar close to your legs.',
    ],
    safety: 'Never round your back to finish a rep. Use a weight you can move with consistent form.',
  },
  {
    id: 'compound-sumo-deadlift',
    name: 'Sumo Deadlift',
    muscle: 'compound',
    primaryFocus: 'Glutes, quads and adductors',
    secondaryMuscles: ['Hamstrings', 'Adductors', 'Lower back', 'Grip'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Barbell',
    sets: 3,
    reps: '3-5',
    restSeconds: 180,
    instructions: [
      'Take a wide stance with toes turned out and grip the bar inside your knees.',
      'Push your knees out, brace and drive the floor apart to stand up.',
      'Lower the bar under control, keeping your chest up.',
    ],
    safety: 'Keep your knees tracking over your toes. Build up stance width gradually to protect your hips.',
  },
  {
    id: 'compound-trap-bar-deadlift',
    name: 'Trap-Bar Deadlift',
    muscle: 'compound',
    primaryFocus: 'Quads, glutes and back',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Quads', 'Traps', 'Grip'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'compound',
    equipment: 'Trap bar (hex bar)',
    sets: 3,
    reps: '4-6',
    restSeconds: 180,
    instructions: [
      'Stand in the centre of the trap bar and grip the handles at your sides.',
      'Brace, then push the floor away until you stand tall with the bar at your sides.',
      'Lower under control by bending hips and knees together.',
    ],
    safety: 'Keep your back neutral and the bar balanced. The handles make the lift friendlier, but load still needs to build gradually.',
  },
  {
    id: 'compound-paused-squat',
    name: 'Paused Squat',
    muscle: 'compound',
    primaryFocus: 'Quads and glutes',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Barbell, squat rack',
    sets: 3,
    reps: '3-5',
    restSeconds: 180,
    needsSpotter: true,
    instructions: [
      'Squat down to your normal depth as you would for a back squat.',
      'Hold the bottom position for 2 seconds while staying braced and tight.',
      'Drive up without bouncing.',
    ],
    safety: 'Use roughly 15–20% less weight than your normal squat. Always set the safety bars.',
  },
  {
    id: 'compound-tempo-bench',
    name: 'Tempo Bench Press',
    muscle: 'compound',
    primaryFocus: 'Chest, front delts and triceps',
    secondaryMuscles: ['Triceps', 'Front delts'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Barbell, flat bench',
    sets: 3,
    reps: '4-6',
    restSeconds: 180,
    needsSpotter: true,
    instructions: [
      'Set up for a normal bench press.',
      'Lower the bar slowly over 3–4 seconds to your chest.',
      'Touch lightly, then press up at normal speed.',
    ],
    safety: 'Slow lowering is tiring — use a lighter weight and always have a spotter or safety arms.',
  },
  {
    id: 'compound-weighted-chin-up',
    name: 'Weighted Chin-Ups',
    muscle: 'compound',
    primaryFocus: 'Lats and biceps',
    secondaryMuscles: ['Biceps', 'Core', 'Grip'],
    levels: ['advanced'],
    type: 'compound',
    equipment: 'Pull-up bar, dip belt with plate',
    sets: 3,
    reps: '5-8',
    restSeconds: 180,
    instructions: [
      'Hang with a shoulder-width, palms-facing-you grip and weight on a dip belt.',
      'Pull your chin over the bar by driving your elbows down.',
      'Lower under control to straight arms.',
    ],
    safety: 'Add weight only after 10+ strict bodyweight chin-ups. Avoid a jerky, half-range bottom.',
  },
  {
    id: 'compound-farmers-carry',
    name: "Farmer's Carry",
    muscle: 'compound',
    primaryFocus: 'Grip, traps and core',
    secondaryMuscles: ['Forearms', 'Traps', 'Core', 'Legs'],
    levels: ['beginner', 'intermediate', 'advanced'],
    type: 'compound',
    equipment: "Dumbbells, kettlebells or farmer's handles",
    sets: 3,
    reps: '30-40 m',
    restSeconds: 120,
    instructions: [
      'Deadlift a heavy weight in each hand and stand tall.',
      'Walk with short, controlled steps, shoulders down and core braced.',
      'Set the weights down with a flat back at the end.',
    ],
    safety: 'Pick up and put down the weights with a flat back. Walk on a clear, non-slippery path.',
  },
];

export const EXERCISES = [
  ...ORIGINAL_EXERCISES.map((exercise) => ({
    secondaryMuscles: [],
    needsSpotter: false,
    ...exercise,
    ...ORIGINAL_METADATA[exercise.id],
  })),
  ...ADVANCED_EXERCISES.map((exercise) => ({ needsSpotter: false, ...exercise })),
  ...SPECIALTY_EXERCISES.map((exercise) => ({ needsSpotter: false, secondaryMuscles: [], ...exercise })),
];

// Short helper for plan entries: optional overrides for sets, reps, rest and warm-up sets.
// Warm-up sets are lighter preparation sets done before the working sets; they are not counted.
function entry(exerciseId, sets, reps, restSeconds, warmupSets) {
  return { exerciseId, sets, reps, restSeconds, warmupSets };
}

// schedule lists Monday → Sunday; null means a rest day.
const STRENGTH_PLANS = [
  {
    id: 'beginner-3',
    name: 'Beginner 3-Day Full Body',
    level: 'Beginner',
    daysPerWeek: 3,
    description:
      'Three full-body sessions a week with a rest day between each. A good starting point to learn the main lifts.',
    recoveryNote: 'Rest at least one day between sessions. Each muscle is trained three times a week at low volume.',
    days: [
      {
        id: 'b3-a',
        title: 'Full Body A',
        focus: 'Squat, press and pull',
        estimatedMinutes: 45,
        exercises: [
          entry('legs-goblet-squat'),
          entry('chest-db-bench-press'),
          entry('back-lat-pulldown'),
          entry('shoulders-db-press', 2),
          entry('core-plank', 2),
        ],
      },
      {
        id: 'b3-b',
        title: 'Full Body B',
        focus: 'Hinge, push and row',
        estimatedMinutes: 45,
        exercises: [
          entry('legs-romanian-deadlift'),
          entry('chest-push-up'),
          entry('back-seated-cable-row'),
          entry('shoulders-lateral-raise', 2),
          entry('core-dead-bug', 2),
        ],
      },
      {
        id: 'b3-c',
        title: 'Full Body C',
        focus: 'Legs, upper body and arms',
        estimatedMinutes: 50,
        exercises: [
          entry('legs-leg-press'),
          entry('chest-incline-db-press'),
          entry('back-one-arm-db-row'),
          entry('biceps-hammer-curl', 2),
          entry('triceps-pushdown', 2),
          entry('core-side-plank'),
        ],
      },
    ],
    schedule: ['b3-a', null, 'b3-b', null, 'b3-c', null, null],
  },
  {
    id: 'beginner-4',
    name: 'Beginner 4-Day Upper/Lower',
    level: 'Beginner',
    daysPerWeek: 4,
    description:
      'Two upper-body and two lower-body days. A step up once you are comfortable training three times a week.',
    recoveryNote: 'Wednesday and the weekend are rest days. Light walking or stretching on rest days is fine.',
    days: [
      {
        id: 'b4-upper-a',
        title: 'Upper A',
        focus: 'Chest, back, shoulders and arms',
        estimatedMinutes: 50,
        exercises: [
          entry('chest-db-bench-press'),
          entry('back-lat-pulldown'),
          entry('shoulders-db-press'),
          entry('back-seated-cable-row'),
          entry('triceps-pushdown', 2),
          entry('biceps-db-curl', 2),
        ],
      },
      {
        id: 'b4-lower-a',
        title: 'Lower A',
        focus: 'Quads, hamstrings and core',
        estimatedMinutes: 45,
        exercises: [
          entry('legs-goblet-squat'),
          entry('legs-romanian-deadlift'),
          entry('legs-leg-extension', 2),
          entry('legs-calf-raise'),
          entry('core-plank'),
        ],
      },
      {
        id: 'b4-upper-b',
        title: 'Upper B',
        focus: 'Incline press, rows and arms',
        estimatedMinutes: 50,
        exercises: [
          entry('chest-incline-db-press'),
          entry('back-one-arm-db-row'),
          entry('shoulders-lateral-raise'),
          entry('chest-push-up', 2),
          entry('biceps-hammer-curl', 2),
          entry('triceps-overhead-extension', 2),
        ],
      },
      {
        id: 'b4-lower-b',
        title: 'Lower B',
        focus: 'Leg press, lunges and core',
        estimatedMinutes: 45,
        exercises: [
          entry('legs-leg-press'),
          entry('legs-walking-lunge', 2),
          entry('legs-leg-curl'),
          entry('legs-calf-raise'),
          entry('core-dead-bug'),
          entry('core-side-plank'),
        ],
      },
    ],
    schedule: ['b4-upper-a', 'b4-lower-a', null, 'b4-upper-b', 'b4-lower-b', null, null],
  },
  {
    id: 'intermediate-4',
    name: 'Intermediate 4-Day Upper/Lower',
    level: 'Intermediate',
    daysPerWeek: 4,
    description:
      'Heavier compound lifts plus accessory work. For lifters with at least 6–12 months of consistent training.',
    recoveryNote: 'Take Wednesday and the weekend off. Aim for 7–9 hours of sleep to recover from the heavier work.',
    days: [
      {
        id: 'i4-upper-a',
        title: 'Upper Strength',
        focus: 'Heavy bench and rows',
        estimatedMinutes: 60,
        exercises: [
          entry('chest-barbell-bench-press', 4, '6-8'),
          entry('back-barbell-row', 4, '6-8'),
          entry('shoulders-db-press', 3, '8-10'),
          entry('back-lat-pulldown', 3, '10-12', 90),
          entry('triceps-pushdown'),
          entry('biceps-barbell-curl'),
        ],
      },
      {
        id: 'i4-lower-a',
        title: 'Lower Strength',
        focus: 'Heavy squats and hinges',
        estimatedMinutes: 60,
        exercises: [
          entry('legs-back-squat', 4, '6-8'),
          entry('legs-romanian-deadlift'),
          entry('legs-leg-press', 3, '10-12'),
          entry('legs-leg-curl'),
          entry('legs-calf-raise'),
          entry('core-hanging-knee-raise'),
        ],
      },
      {
        id: 'i4-upper-b',
        title: 'Upper Volume',
        focus: 'Incline press, pull-ups and shoulders',
        estimatedMinutes: 60,
        exercises: [
          entry('chest-incline-db-press', 4, '8-10'),
          entry('back-pull-up'),
          entry('back-seated-cable-row'),
          entry('shoulders-lateral-raise'),
          entry('shoulders-face-pull'),
          entry('biceps-hammer-curl'),
          entry('triceps-overhead-extension'),
        ],
      },
      {
        id: 'i4-lower-b',
        title: 'Lower Volume',
        focus: 'Leg press, lunges and core',
        estimatedMinutes: 55,
        exercises: [
          entry('legs-leg-press', 4, '10-12'),
          entry('legs-walking-lunge'),
          entry('legs-romanian-deadlift', 3, '10-12'),
          entry('legs-leg-extension'),
          entry('legs-calf-raise'),
          entry('core-cable-crunch'),
        ],
      },
    ],
    schedule: ['i4-upper-a', 'i4-lower-a', null, 'i4-upper-b', 'i4-lower-b', null, null],
  },
  {
    id: 'intermediate-6',
    name: 'Intermediate 6-Day Push/Pull/Legs',
    level: 'Intermediate',
    daysPerWeek: 6,
    description:
      'Push, pull and legs, twice a week. High frequency for experienced lifters who recover well and can train most days.',
    recoveryNote:
      'Sunday is a full rest day. If you feel run down, joints ache or strength drops for over a week, take an extra rest day or reduce sets.',
    days: [
      {
        id: 'i6-push-a',
        title: 'Push A',
        focus: 'Chest, shoulders and triceps (heavy)',
        estimatedMinutes: 55,
        exercises: [
          entry('chest-barbell-bench-press', 4, '6-8'),
          entry('shoulders-barbell-ohp'),
          entry('chest-incline-db-press', 3, '8-10'),
          entry('shoulders-lateral-raise'),
          entry('triceps-pushdown'),
        ],
      },
      {
        id: 'i6-pull-a',
        title: 'Pull A',
        focus: 'Back and biceps (heavy)',
        estimatedMinutes: 55,
        exercises: [
          entry('back-barbell-row', 4, '6-8'),
          entry('back-pull-up'),
          entry('shoulders-face-pull'),
          entry('biceps-barbell-curl', 3, '8-10'),
          entry('biceps-hammer-curl', 2),
        ],
      },
      {
        id: 'i6-legs-a',
        title: 'Legs A',
        focus: 'Squat focus',
        estimatedMinutes: 60,
        exercises: [
          entry('legs-back-squat', 4, '6-8'),
          entry('legs-romanian-deadlift'),
          entry('legs-leg-curl'),
          entry('legs-calf-raise', 4, '10-15'),
          entry('core-plank'),
        ],
      },
      {
        id: 'i6-push-b',
        title: 'Push B',
        focus: 'Chest, shoulders and triceps (volume)',
        estimatedMinutes: 55,
        exercises: [
          entry('chest-incline-db-press', 4, '8-10'),
          entry('shoulders-db-press', 3, '8-10'),
          entry('chest-dip'),
          entry('chest-db-fly'),
          entry('triceps-overhead-extension'),
        ],
      },
      {
        id: 'i6-pull-b',
        title: 'Pull B',
        focus: 'Back and biceps (volume)',
        estimatedMinutes: 55,
        exercises: [
          entry('back-lat-pulldown', 4, '8-10'),
          entry('back-one-arm-db-row'),
          entry('back-seated-cable-row'),
          entry('shoulders-rear-delt-fly'),
          entry('biceps-incline-db-curl'),
        ],
      },
      {
        id: 'i6-legs-b',
        title: 'Legs B',
        focus: 'Leg press and unilateral work',
        estimatedMinutes: 55,
        exercises: [
          entry('legs-leg-press', 4, '10-12'),
          entry('legs-walking-lunge'),
          entry('legs-leg-extension'),
          entry('legs-leg-curl'),
          entry('core-hanging-knee-raise'),
        ],
      },
    ],
    schedule: ['i6-push-a', 'i6-pull-a', 'i6-legs-a', 'i6-push-b', 'i6-pull-b', 'i6-legs-b', null],
  },

  // ---------- Advanced (Option A, B, C) ----------
  {
    id: 'advanced-ppl-6',
    name: 'Advanced 6-Day Push/Pull/Legs',
    level: 'Advanced',
    daysPerWeek: 6,
    description:
      'Option A. Heavy and volume push, pull and leg days, twice a week. For lifters with 2+ years of consistent, structured training.',
    recoveryNote:
      'Day 7 is rest or light recovery (walking, mobility). Take a lighter "deload" week every 5–8 weeks, or sooner if performance drops.',
    days: [
      {
        id: 'apl-push-a',
        title: 'Push — Heavy',
        focus: 'Chest, shoulders, triceps',
        estimatedMinutes: 75,
        exercises: [
          entry('chest-barbell-bench-press', 4, '4-6', 180, 3),
          entry('shoulders-barbell-ohp', 3, '5-8', 150, 2),
          entry('chest-incline-db-press', 3, '8-10', 120),
          entry('chest-weighted-dip', 3, '6-10', 150),
          entry('shoulders-cable-lateral-raise', 3, '12-15', 75),
          entry('triceps-overhead-cable-extension', 3, '10-12', 75),
        ],
      },
      {
        id: 'apl-pull-a',
        title: 'Pull — Heavy',
        focus: 'Back, biceps',
        estimatedMinutes: 70,
        exercises: [
          entry('back-weighted-pull-up', 4, '5-8', 180, 2),
          entry('back-pendlay-row', 4, '5-8', 150, 2),
          entry('back-chest-supported-row', 3, '8-12', 120),
          entry('shoulders-face-pull', 3, '12-15', 60),
          entry('biceps-ez-preacher-curl', 3, '8-12', 75),
          entry('biceps-hammer-curl', 2, '10-12', 75),
        ],
      },
      {
        id: 'apl-legs-a',
        title: 'Legs & Core — Squat',
        focus: 'Quads, glutes, hamstrings, core',
        estimatedMinutes: 75,
        exercises: [
          entry('legs-back-squat', 4, '4-6', 180, 3),
          entry('legs-romanian-deadlift', 3, '6-8', 150, 1),
          entry('legs-leg-press', 3, '10-12', 120),
          entry('legs-leg-curl', 3, '10-12', 75),
          entry('legs-calf-raise', 4, '10-15', 60),
          entry('core-hanging-leg-raise', 3, '10-15', 75),
        ],
      },
      {
        id: 'apl-push-b',
        title: 'Push — Volume',
        focus: 'Chest, shoulders, triceps',
        estimatedMinutes: 70,
        exercises: [
          entry('chest-incline-barbell-bench', 4, '6-8', 150, 2),
          entry('shoulders-db-press', 3, '8-10', 120),
          entry('chest-machine-press', 3, '10-12', 90),
          entry('chest-cable-crossover', 3, '12-15', 75),
          entry('shoulders-lateral-raise', 3, '12-15', 60),
          entry('triceps-skull-crusher', 3, '8-12', 90),
        ],
      },
      {
        id: 'apl-pull-b',
        title: 'Pull — Volume',
        focus: 'Back, biceps',
        estimatedMinutes: 70,
        exercises: [
          entry('compound-conventional-deadlift', 3, '3-5', 180, 3),
          entry('back-lat-pulldown', 3, '8-12', 120),
          entry('back-t-bar-row', 3, '8-10', 120),
          entry('back-straight-arm-pulldown', 3, '12-15', 75),
          entry('shoulders-reverse-pec-deck', 3, '12-15', 60),
          entry('biceps-incline-db-curl', 3, '10-12', 75),
        ],
      },
      {
        id: 'apl-legs-b',
        title: 'Legs & Core — Front Squat',
        focus: 'Quads, glutes, hamstrings, core',
        estimatedMinutes: 70,
        exercises: [
          entry('legs-front-squat', 4, '5-8', 180, 2),
          entry('legs-bulgarian-split-squat', 3, '8-10 per leg', 120),
          entry('legs-hip-thrust', 3, '8-12', 120),
          entry('legs-leg-extension', 3, '12-15', 75),
          entry('legs-leg-curl', 3, '10-12', 75),
          entry('core-ab-wheel', 3, '8-12', 75),
        ],
      },
    ],
    schedule: ['apl-push-a', 'apl-pull-a', 'apl-legs-a', 'apl-push-b', 'apl-pull-b', 'apl-legs-b', null],
  },
  {
    id: 'advanced-ul-4',
    name: 'Advanced 4-Day Upper/Lower',
    level: 'Advanced',
    daysPerWeek: 4,
    description:
      'Option B. Two strength-focused upper and lower days per week with accessory work. Good balance of intensity and recovery.',
    recoveryNote: 'Day 3 and days 6–7 are rest or recovery. Keep 1–3 reps in reserve on most sets.',
    days: [
      {
        id: 'aul-upper-1',
        title: 'Upper 1 — Strength',
        focus: 'Bench, pull-ups, overhead press, rows',
        estimatedMinutes: 75,
        exercises: [
          entry('chest-barbell-bench-press', 4, '4-6', 180, 3),
          entry('back-weighted-pull-up', 4, '5-8', 180, 2),
          entry('shoulders-barbell-ohp', 3, '6-8', 150, 1),
          entry('back-pendlay-row', 3, '6-8', 150),
          entry('shoulders-cable-lateral-raise', 3, '12-15', 75),
          entry('biceps-barbell-curl', 2, '8-12', 75),
          entry('triceps-skull-crusher', 2, '8-12', 90),
        ],
      },
      {
        id: 'aul-lower-1',
        title: 'Lower 1 — Squat',
        focus: 'Squat, hinge, legs, core',
        estimatedMinutes: 70,
        exercises: [
          entry('legs-back-squat', 4, '4-6', 180, 3),
          entry('legs-romanian-deadlift', 3, '6-8', 150, 1),
          entry('legs-leg-press', 3, '10-12', 120),
          entry('legs-leg-curl', 3, '10-12', 75),
          entry('legs-calf-raise', 3, '10-15', 60),
          entry('core-pallof-press', 3, '10-12 per side', 60),
        ],
      },
      {
        id: 'aul-upper-2',
        title: 'Upper 2 — Volume',
        focus: 'Incline press, rows, shoulders, arms',
        estimatedMinutes: 75,
        exercises: [
          entry('chest-incline-barbell-bench', 4, '6-8', 150, 2),
          entry('back-chest-supported-row', 4, '8-10', 120),
          entry('shoulders-arnold-press', 3, '8-10', 120),
          entry('back-lat-pulldown', 3, '8-12', 120),
          entry('chest-cable-crossover', 2, '12-15', 75),
          entry('biceps-hammer-curl', 3, '10-12', 75),
          entry('triceps-overhead-cable-extension', 3, '10-12', 75),
        ],
      },
      {
        id: 'aul-lower-2',
        title: 'Lower 2 — Deadlift',
        focus: 'Deadlift, single-leg, glutes, core',
        estimatedMinutes: 70,
        exercises: [
          entry('compound-conventional-deadlift', 3, '3-5', 180, 3),
          entry('legs-bulgarian-split-squat', 3, '8-10 per leg', 120),
          entry('legs-hip-thrust', 3, '8-12', 120),
          entry('legs-leg-extension', 3, '12-15', 75),
          entry('legs-calf-raise', 3, '10-15', 60),
          entry('core-hanging-leg-raise', 3, '10-15', 75),
        ],
      },
    ],
    schedule: ['aul-upper-1', 'aul-lower-1', null, 'aul-upper-2', 'aul-lower-2', null, null],
  },
  {
    id: 'advanced-bro-5',
    name: 'Advanced 5-Day Bro Split',
    level: 'Advanced',
    daysPerWeek: 5,
    description:
      'Option C. One muscle group per day with high volume per session. Each muscle is trained hard once a week.',
    recoveryNote: 'Days 6–7 are rest or recovery. Sessions are long — keep warm-ups thorough and stop sets 1–2 reps before failure.',
    days: [
      {
        id: 'abs-chest',
        title: 'Chest',
        focus: 'Flat, incline and fly work',
        estimatedMinutes: 70,
        exercises: [
          entry('chest-barbell-bench-press', 4, '4-6', 180, 3),
          entry('chest-incline-barbell-bench', 3, '6-8', 150, 1),
          entry('chest-weighted-dip', 3, '6-10', 150),
          entry('chest-db-fly', 3, '10-12', 90),
          entry('chest-cable-crossover', 3, '12-15', 75),
          entry('chest-machine-press', 2, '10-12', 90),
        ],
      },
      {
        id: 'abs-back',
        title: 'Back',
        focus: 'Deadlift, vertical and horizontal pulls',
        estimatedMinutes: 75,
        exercises: [
          entry('compound-conventional-deadlift', 3, '3-5', 180, 3),
          entry('back-weighted-pull-up', 4, '5-8', 180, 1),
          entry('back-barbell-row', 3, '6-8', 150),
          entry('back-t-bar-row', 3, '8-10', 120),
          entry('back-straight-arm-pulldown', 3, '12-15', 75),
          entry('back-lat-pulldown', 2, '10-12', 90),
        ],
      },
      {
        id: 'abs-shoulders',
        title: 'Shoulders',
        focus: 'Pressing plus all three delt heads',
        estimatedMinutes: 65,
        exercises: [
          entry('shoulders-barbell-ohp', 4, '5-8', 150, 2),
          entry('shoulders-db-press', 3, '8-10', 120),
          entry('shoulders-cable-lateral-raise', 4, '12-15', 75),
          entry('shoulders-lateral-raise', 3, '12-15', 60),
          entry('shoulders-reverse-pec-deck', 3, '12-15', 60),
          entry('shoulders-face-pull', 3, '12-15', 60),
        ],
      },
      {
        id: 'abs-legs',
        title: 'Legs',
        focus: 'Quads, hamstrings, glutes, calves',
        estimatedMinutes: 75,
        exercises: [
          entry('legs-back-squat', 4, '4-6', 180, 3),
          entry('legs-hack-squat', 3, '8-10', 150),
          entry('legs-romanian-deadlift', 3, '6-8', 150),
          entry('legs-leg-curl', 3, '10-12', 75),
          entry('legs-leg-extension', 3, '12-15', 75),
          entry('legs-calf-raise', 4, '10-15', 60),
        ],
      },
      {
        id: 'abs-arms-core',
        title: 'Arms & Core',
        focus: 'Biceps, triceps, abs',
        estimatedMinutes: 70,
        exercises: [
          entry('triceps-close-grip-bench', 3, '6-8', 150, 2),
          entry('biceps-ez-preacher-curl', 3, '8-12', 75),
          entry('triceps-skull-crusher', 3, '8-12', 90),
          entry('biceps-incline-db-curl', 3, '10-12', 75),
          entry('triceps-pushdown', 3, '10-15', 60),
          entry('biceps-cable-curl', 2, '12-15', 60),
          entry('core-hanging-leg-raise', 3, '10-15', 75),
          entry('core-cable-crunch', 3, '12-15', 60),
        ],
      },
    ],
    schedule: ['abs-chest', 'abs-back', 'abs-shoulders', 'abs-legs', 'abs-arms-core', null, null],
  },
];

// The original strength plans come first and are unchanged; specialty plans (HYROX-style, CrossFit-style,
// core, fat loss, women's cardio, prenatal) follow. Optional plan fields: notes, safetyNotice,
// clearanceNotice, requiresClearance. Optional day fields: format, warmup, cooldown, scaling.
export const WORKOUT_PLANS = [
  ...STRENGTH_PLANS.map((plan) => ({ category: 'strength', ...plan })),
  ...SPECIALTY_PLANS,
];

export function getPlanCategoryName(plan) {
  return PLAN_CATEGORIES.find((category) => category.id === plan?.category)?.name ?? '';
}

export const DEFAULT_PLAN_ID = 'beginner-3';

export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const RECOVERY_GUIDANCE = [
  'Warm up for 5–10 minutes with light cardio and a few lighter sets before your working sets.',
  'Leave 1–3 reps in reserve on most sets. You do not need to train to failure to make progress.',
  'Add weight or reps gradually, only when you can complete every set with good form.',
  'Sleep 7–9 hours and eat enough protein to support recovery.',
  'Muscle soreness is normal. Sharp or joint pain is not — stop that exercise and get it checked.',
  'Every 6–8 weeks, consider an easier week with fewer sets to let your body recover.',
];

export const REST_DAY_TIPS = [
  'Rest days are when muscles repair and grow. Enjoy it — you have earned it.',
  'A 20–30 minute easy walk helps blood flow and recovery without adding fatigue.',
  'Gentle stretching or mobility work for 10 minutes can ease stiffness from training.',
  'Keep eating enough protein today — recovery still needs fuel on rest days.',
  'Aim for 7–9 hours of sleep tonight to recover well for your next session.',
  'Stay hydrated on rest days too; your water goal still counts.',
];

export const ADVANCED_NOTICE =
  'Advanced exercises and plans are intended for lifters with appropriate training experience (usually 2+ years of ' +
  'consistent, structured lifting). Adapt exercises, loads and volume to your own ability, and swap any movement that causes pain.';

export const ADVANCED_GUIDANCE = [
  'Warm-up sets are lighter preparation sets (for example 40%, 60%, 80% of your working weight). They are not counted as working sets.',
  'Working sets should end with 1–3 reps in reserve. Training every set to failure is not recommended.',
  'Main lifts: 3–4 working sets of 4–8 reps, resting 2–3 minutes or longer if needed.',
  'Accessory compound lifts: 3–4 sets of 6–12 reps. Isolation work: 2–4 sets of 10–15 reps with 60–120 seconds rest.',
  'Maximal (1-rep max) attempts are not part of these plans. Progress by adding small amounts of weight or reps over time.',
  'Use safety bars, collars and a spotter for heavy squats and presses. Stop any exercise that causes sharp or joint pain.',
];

export const WARMUP_GUIDANCE =
  'Before heavy compound lifts, do 2–3 progressively heavier warm-up sets with fewer reps. They prepare your joints and are not counted as working sets.';

export const WORKOUT_DISCLAIMER =
  'These are sample plans for generally healthy adults, not personalised or medical advice. ' +
  'If you have an injury, a health condition or are new to exercise, check with a doctor or qualified trainer first.';

export function getExerciseById(exerciseId) {
  return EXERCISES.find((exercise) => exercise.id === exerciseId) ?? null;
}

export function getMuscleGroupById(muscleId) {
  return MUSCLE_GROUPS.find((group) => group.id === muscleId) ?? null;
}

export function getExercisesByMuscle(muscleId) {
  return EXERCISES.filter((exercise) => exercise.muscle === muscleId);
}

export function getLevelNames(exercise) {
  return DIFFICULTY_LEVELS.filter((level) => exercise.levels?.includes(level.id)).map((level) => level.name);
}

// Equipment categories derived from the equipment text, so the text stays the single source of truth.
export function getEquipmentTypes(exercise) {
  const text = String(exercise?.equipment ?? '').toLowerCase();
  const withoutCableMachine = text.replace(/cable machine/g, '');
  const types = [];
  if (/barbell|ez bar|t-bar|landmine/.test(text)) types.push('barbell');
  if (/dumbbell/.test(text)) types.push('dumbbell');
  if (/cable/.test(text)) types.push('cable');
  if (/machine|pec deck|leg press/.test(withoutCableMachine)) types.push('machine');
  if (/bodyweight|pull-up bar|parallel bars|^bench$/.test(text)) types.push('bodyweight');
  if (/kettlebell|ab wheel|band|plate|farmer/.test(text) || types.length === 0) types.push('other');
  return types;
}

// Search (all words must appear in the name, in any order) plus optional filters. 'all' disables a filter.
export function filterExercises({ query = '', muscleId = 'all', equipmentId = 'all', levelId = 'all' } = {}) {
  const words = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  return EXERCISES.filter((exercise) => {
    if (muscleId !== 'all' && exercise.muscle !== muscleId) return false;
    if (levelId !== 'all' && !exercise.levels?.includes(levelId)) return false;
    if (equipmentId !== 'all' && !getEquipmentTypes(exercise).includes(equipmentId)) return false;
    const name = exercise.name.toLowerCase();
    return words.every((word) => name.includes(word));
  });
}

export function getPlanById(planId) {
  return WORKOUT_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function getPlanDay(planId, dayId) {
  const plan = getPlanById(planId);
  const day = plan ? plan.days.find((item) => item.id === dayId) ?? null : null;
  return { plan, day };
}

// Resolves plan entries into full exercises with the entry's sets/reps/rest/warm-ups applied.
// Unknown exercise IDs are skipped so bad data can never crash a screen.
export function resolveEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((item) => {
      const exercise = getExerciseById(item?.exerciseId);
      if (!exercise) return null;
      return {
        ...exercise,
        sets: item.sets ?? exercise.sets,
        reps: item.reps ?? exercise.reps,
        restSeconds: item.restSeconds ?? exercise.restSeconds,
        warmupSets: item.warmupSets ?? 0,
      };
    })
    .filter(Boolean);
}

// The built-in (default) exercises for a plan day.
export function getDayExercises(day) {
  return resolveEntries(day?.exercises);
}

// Turns a resolved exercise back into a plain, fully specified entry (used for custom plans and sessions).
export function toEntry(exercise) {
  return {
    exerciseId: exercise.id,
    sets: exercise.sets,
    reps: exercise.reps,
    restSeconds: exercise.restSeconds,
    warmupSets: exercise.warmupSets ?? 0,
  };
}

// Default entry when a user adds an exercise to a day: library defaults, 1 warm-up set for compounds.
export function createDefaultEntry(exerciseId) {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;
  return toEntry({ ...exercise, warmupSets: exercise.type === 'compound' ? 1 : 0 });
}

// "2 warm-up + 4 × 4-6 · rest 180 s"
export function describeEntry(exercise) {
  const warmup = exercise.warmupSets > 0 ? `${exercise.warmupSets} warm-up + ` : '';
  return `${warmup}${exercise.sets} × ${exercise.reps} · rest ${exercise.restSeconds} s`;
}

// Monday = 0 … Sunday = 6, matching plan.schedule.
export function getWeekdayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function getScheduledDay(planId, date) {
  const plan = getPlanById(planId) ?? getPlanById(DEFAULT_PLAN_ID);
  const weekdayIndex = getWeekdayIndex(date);
  const dayId = plan.schedule[weekdayIndex];
  const day = dayId ? plan.days.find((item) => item.id === dayId) ?? null : null;
  return { plan, day, weekdayName: WEEKDAY_NAMES[weekdayIndex] };
}
