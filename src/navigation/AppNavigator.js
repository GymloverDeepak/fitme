import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/AboutScreen';
import DeadliftScreen from '../screens/DeadliftScreen';
import DeadliftSessionScreen from '../screens/DeadliftSessionScreen';
import DeadliftSetupScreen from '../screens/DeadliftSetupScreen';
import DeadliftSummaryScreen from '../screens/DeadliftSummaryScreen';
import DesignPreviewScreen from '../screens/DesignPreviewScreen';
import DietScreen from '../screens/DietScreen';
import EditWorkoutDayScreen from '../screens/EditWorkoutDayScreen';
import ExerciseDetailsScreen from '../screens/ExerciseDetailsScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import HomeScreen from '../screens/HomeScreen';
import MealDetailsScreen from '../screens/MealDetailsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SessionSummaryScreen from '../screens/SessionSummaryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkoutDayScreen from '../screens/WorkoutDayScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';
import { colors } from '../theme';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

const TABS = [
  { name: ROUTES.HOME, component: HomeScreen, icon: 'home', label: 'Home' },
  { name: ROUTES.WORKOUT, component: WorkoutScreen, icon: 'barbell', label: 'Workout' },
  { name: ROUTES.DIET, component: DietScreen, icon: 'restaurant', label: 'Diet' },
  { name: ROUTES.PROGRESS, component: ProgressScreen, icon: 'stats-chart', label: 'Progress' },
  { name: ROUTES.SETTINGS, component: SettingsScreen, icon: 'settings', label: 'Settings' },
];

function MainTabs() {
  return (
    <Tab.Navigator
      // Android back on any tab returns to Home first; back on Home leaves the app.
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.label,
            tabBarAccessibilityLabel: `${tab.label} tab`,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? tab.icon : `${tab.icon}-outline`} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name={ROUTES.TABS} component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTES.WORKOUT_DAY} component={WorkoutDayScreen} options={{ title: 'Workout Day' }} />
        <Stack.Screen name={ROUTES.EDIT_WORKOUT_DAY} component={EditWorkoutDayScreen} options={{ title: 'Edit Workout' }} />
        <Stack.Screen name={ROUTES.WORKOUT_SESSION} component={WorkoutSessionScreen} options={{ title: 'Workout Session' }} />
        <Stack.Screen name={ROUTES.SESSION_SUMMARY} component={SessionSummaryScreen} options={{ title: 'Session Summary' }} />
        <Stack.Screen name={ROUTES.EXERCISE_LIBRARY} component={ExerciseLibraryScreen} options={{ title: 'Exercise Library' }} />
        <Stack.Screen name={ROUTES.EXERCISE_DETAILS} component={ExerciseDetailsScreen} options={{ title: 'Exercise Details' }} />
        <Stack.Screen name={ROUTES.MEAL_DETAILS} component={MealDetailsScreen} options={{ title: 'Meal Details' }} />
        <Stack.Screen name={ROUTES.DEADLIFT} component={DeadliftScreen} options={{ title: 'Deadlift Planner' }} />
        <Stack.Screen name={ROUTES.DEADLIFT_SETUP} component={DeadliftSetupScreen} options={{ title: 'Deadlift Plan & Calculator' }} />
        <Stack.Screen name={ROUTES.DEADLIFT_SESSION} component={DeadliftSessionScreen} options={{ title: 'Deadlift Session' }} />
        <Stack.Screen name={ROUTES.DEADLIFT_SUMMARY} component={DeadliftSummaryScreen} options={{ title: 'Deadlift Summary' }} />
        <Stack.Screen name={ROUTES.ABOUT} component={AboutScreen} options={{ title: 'About FITME' }} />
        <Stack.Screen name={ROUTES.DESIGN_PREVIEW} component={DesignPreviewScreen} options={{ title: 'Design Preview' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
