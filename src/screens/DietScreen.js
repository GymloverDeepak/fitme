import { StyleSheet, Text, View } from 'react-native';

import ChipGroup from '../components/ChipGroup';
import EmptyState from '../components/EmptyState';
import FitnessCard from '../components/FitnessCard';
import MealCard from '../components/MealCard';
import Notice from '../components/Notice';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import {
  DIET_DISCLAIMER,
  DIET_GOALS,
  DIET_PREFERENCES,
  HYDRATION_GUIDANCE,
  NUTRITION_ESTIMATE_NOTE,
  NUTRITION_GUIDANCE,
  getDayNutrition,
  getMealCategoryName,
  getMealNutrition,
  getMealsFor,
} from '../data/dietPlans';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { colors, spacing, typography } from '../theme';

function GuidanceList({ items }) {
  return items.map((text) => (
    <Text key={text} style={styles.body}>
      •  {text}
    </Text>
  ));
}

export default function DietScreen({ navigation }) {
  const { settings, updateSettings } = useAppState();
  const meals = getMealsFor(settings.dietGoal, settings.dietPreference);
  const total = getDayNutrition(meals);
  const goalName = DIET_GOALS.find((goal) => goal.id === settings.dietGoal)?.name ?? '';
  const preferenceName = DIET_PREFERENCES.find((item) => item.id === settings.dietPreference)?.name ?? '';

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Indian diet planner
        </Text>
        <Text style={styles.caption}>Affordable home-style meals. Your choices are saved on this device.</Text>
      </View>

      <Notice tone="warning" title="Sample plan" message={DIET_DISCLAIMER} />

      <View style={styles.group}>
        <Text style={styles.label}>Goal</Text>
        <ChipGroup
          options={DIET_GOALS}
          selectedId={settings.dietGoal}
          onSelect={(dietGoal) => updateSettings({ dietGoal })}
          accessibilityLabel="Diet goal"
        />
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>Preference</Text>
        <ChipGroup
          options={DIET_PREFERENCES}
          selectedId={settings.dietPreference}
          onSelect={(dietPreference) => updateSettings({ dietPreference })}
          accessibilityLabel="Diet preference"
        />
      </View>

      <SectionHeading title="Day at a glance" subtitle={`${goalName} · ${preferenceName}`} />
      <StatRow>
        <StatCard label="Est. energy" value={`≈ ${total.calories}`} unit="kcal" caption="Plus oil & “varies” items" />
        <StatCard label="Est. protein" value={`≈ ${total.protein}`} unit="g" caption="From listed items" />
      </StatRow>

      <SectionHeading title="Meals" subtitle="Tap a meal for servings and details" />
      {meals.length === 0 ? (
        <EmptyState title="No meals found" message="There is no sample plan for this combination yet." />
      ) : (
        <View style={styles.list}>
          {meals.map((meal) => {
            const nutrition = getMealNutrition(meal);
            return (
              <MealCard
                key={meal.id}
                category={getMealCategoryName(meal.category)}
                name={meal.name}
                description={meal.items.map((item) => item.portion).join(' · ')}
                calories={nutrition.calories}
                protein={nutrition.protein}
                hasUnestimatedItems={nutrition.unestimatedCount > 0}
                onPress={() => navigateSafely(navigation, ROUTES.MEAL_DETAILS, { mealId: meal.id })}
              />
            );
          })}
        </View>
      )}

      <Notice title="About these numbers" message={NUTRITION_ESTIMATE_NOTE} />

      <SectionHeading title="Hydration" />
      <FitnessCard>
        <GuidanceList items={HYDRATION_GUIDANCE} />
      </FitnessCard>

      <SectionHeading title="Balanced nutrition" />
      <FitnessCard>
        <GuidanceList items={NUTRITION_GUIDANCE} />
      </FitnessCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
  },
  caption: {
    ...typography.caption,
  },
  group: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.primary,
  },
  list: {
    gap: spacing.md,
  },
  body: {
    ...typography.body,
  },
});
