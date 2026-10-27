import { StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import {
  DIET_DISCLAIMER,
  DIET_GOALS,
  DIET_PREFERENCES,
  NUTRITION_ESTIMATE_NOTE,
  getFoodById,
  getMealById,
  getMealCategoryName,
  getMealNutrition,
} from '../data/dietPlans';
import { colors, spacing, typography } from '../theme';

export default function MealDetailsScreen({ navigation, route }) {
  const meal = getMealById(route.params?.mealId);

  if (!meal) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState
          icon="alert-circle-outline"
          title="Meal not found"
          message="This meal is not in the FITME sample plans."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  const nutrition = getMealNutrition(meal);
  const goalName = DIET_GOALS.find((goal) => goal.id === meal.goal)?.name;
  const preferenceName = DIET_PREFERENCES.find((item) => item.id === meal.preference)?.name;

  return (
    <ScreenContainer edges={STACK_EDGES}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {getMealCategoryName(meal.category)} · {goalName} · {preferenceName}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {meal.name}
        </Text>
        <Text style={styles.caption}>{meal.description}</Text>
      </View>

      <StatRow>
        <StatCard label="Est. energy" value={`≈ ${nutrition.calories}`} unit="kcal" />
        <StatCard label="Est. protein" value={`≈ ${nutrition.protein}`} unit="g" />
      </StatRow>
      {nutrition.unestimatedCount > 0 ? (
        <Text style={styles.caption}>
          {nutrition.unestimatedCount} item{nutrition.unestimatedCount > 1 ? 's' : ''} marked “varies” and cooking oil
          are not included in these totals.
        </Text>
      ) : null}

      <SectionHeading title="What to eat" subtitle="Serving sizes are approximate" />
      <FitnessCard>
        {meal.items.map((item, index) => {
          const food = getFoodById(item.foodId);
          const hasEstimate = food && food.calories != null && food.protein != null;
          return (
            <View key={`${item.foodId}-${index}`} style={[styles.itemRow, index > 0 && styles.itemDivider]}>
              <View style={styles.itemText}>
                <Text style={styles.itemName}>{item.portion}</Text>
                <Text style={styles.caption}>{food?.name ?? 'Food'}</Text>
              </View>
              <Text style={[styles.itemEstimate, !hasEstimate && styles.itemVaries]}>
                {hasEstimate
                  ? `≈ ${Math.round(food.calories * item.servings)} kcal\n${Math.round(food.protein * item.servings)} g protein`
                  : 'Varies by\nrecipe'}
              </Text>
            </View>
          );
        })}
      </FitnessCard>

      <SectionHeading title="Preparation tip" />
      <FitnessCard>
        <Text style={styles.body}>{meal.tips}</Text>
      </FitnessCard>

      <SectionHeading title="Budget-friendly swap" />
      <FitnessCard>
        <Text style={styles.body}>{meal.affordableSwap}</Text>
      </FitnessCard>

      <Notice title="About these numbers" message={NUTRITION_ESTIMATE_NOTE} />
      <Notice tone="warning" message={DIET_DISCLAIMER} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.accent,
  },
  title: {
    ...typography.title,
  },
  caption: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    ...typography.bodyStrong,
  },
  itemEstimate: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  itemVaries: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
