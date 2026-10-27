// Every screen name in one place. Always navigate with these constants — a typo then becomes an
// undefined value that ESLint and code review catch, instead of a silent navigation to nowhere.
export const ROUTES = {
  TABS: 'Tabs',

  // Bottom tabs
  HOME: 'Home',
  WORKOUT: 'Workout',
  DIET: 'Diet',
  PROGRESS: 'Progress',
  SETTINGS: 'Settings',

  // Stack screens opened on top of the tabs
  WORKOUT_DAY: 'WorkoutDay',
  EDIT_WORKOUT_DAY: 'EditWorkoutDay',
  WORKOUT_SESSION: 'WorkoutSession',
  SESSION_SUMMARY: 'SessionSummary',
  EXERCISE_LIBRARY: 'ExerciseLibrary',
  EXERCISE_DETAILS: 'ExerciseDetails',
  MEAL_DETAILS: 'MealDetails',
  DEADLIFT: 'Deadlift',
  DEADLIFT_SETUP: 'DeadliftSetup',
  DEADLIFT_SESSION: 'DeadliftSession',
  DEADLIFT_SUMMARY: 'DeadliftSummary',
  ABOUT: 'About',
  DESIGN_PREVIEW: 'DesignPreview',
  BMI: 'Bmi',
};

export const TAB_ROUTES = [ROUTES.HOME, ROUTES.WORKOUT, ROUTES.DIET, ROUTES.PROGRESS, ROUTES.SETTINGS];

const KNOWN_ROUTES = new Set(Object.values(ROUTES));

// Navigates only to screens that exist. Tab screens are reached through the tab navigator
// so this works from any screen, including stack screens shown above the tabs.
export function navigateSafely(navigation, routeName, params) {
  if (!KNOWN_ROUTES.has(routeName)) {
    console.warn(`FITME: ignored navigation to unknown screen "${routeName}"`);
    return false;
  }
  if (TAB_ROUTES.includes(routeName)) {
    navigation.navigate(ROUTES.TABS, { screen: routeName, params });
  } else {
    navigation.navigate(routeName, params);
  }
  return true;
}
