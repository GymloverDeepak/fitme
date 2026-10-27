import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import ChipGroup from '../components/ChipGroup';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import {
  ADVANCED_GUIDANCE,
  ADVANCED_NOTICE,
  DIFFICULTY_LEVELS,
  EXERCISES,
  MUSCLE_GROUPS,
  PLAN_CATEGORIES,
  RECOVERY_GUIDANCE,
  WEEKDAY_NAMES,
  WORKOUT_DISCLAIMER,
  WORKOUT_PLANS,
  getPlanById,
  getPlanCategoryName,
  getPlanDay,
  getWeekdayIndex,
} from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { colors, spacing, typography } from '../theme';
import { dateFromKey } from '../utils/date';

const PLAN_LEVEL_OPTIONS = [{ id: 'all', name: 'All' }, ...DIFFICULTY_LEVELS];
const PLAN_CATEGORY_OPTIONS = [{ id: 'all', name: 'All' }, ...PLAN_CATEGORIES];

export default function WorkoutScreen({ navigation }) {
  const { settings, updateSettings, activeSession, todayKey, getDayExercisesFor, isDayCustom } = useAppState();
  const plan = getPlanById(settings.planId) ?? WORKOUT_PLANS[0];
  const todayIndex = getWeekdayIndex(dateFromKey(todayKey));
  const activeDay = activeSession ? getPlanDay(activeSession.planId, activeSession.dayId).day : null;
  const [planLevel, setPlanLevel] = useState('all');
  const [planCategory, setPlanCategory] = useState('all');
  // The current plan always stays visible so the selection is never hidden by a filter.
  const visiblePlans = WORKOUT_PLANS.filter(
    (option) =>
      option.id === plan.id ||
      ((planLevel === 'all' || option.level.toLowerCase() === planLevel) &&
        (planCategory === 'all' || option.category === planCategory)),
  );
  // Advanced lifting guidance applies to the strength plans only.
  const isAdvancedPlan = plan.level === 'Advanced' && plan.category === 'strength';

  const selectPlan = (option) => {
    if (option.id === plan.id) return;
    if (!option.requiresClearance) {
      updateSettings({ planId: option.id });
      return;
    }
    Alert.alert(option.name, `${option.clearanceNotice?.message ?? ''}

Only choose this plan if your clinician has said exercise is suitable for you.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'I have clinician clearance', onPress: () => updateSettings({ planId: option.id }) },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Workout planner
        </Text>
        <Text style={styles.caption}>Choose a weekly plan, then open a day to start a session.</Text>
      </View>

      {activeDay ? (
        <FitnessCard variant="highlight">
          <Text style={styles.cardLabel}>Session in progress</Text>
          <Text style={styles.cardTitle}>{activeDay.title}</Text>
          <PrimaryButton
            title="Resume Session"
            icon="play"
            onPress={() => navigateSafely(navigation, ROUTES.WORKOUT_SESSION)}
          />
        </FitnessCard>
      ) : null}

      <FitnessCard
        onPress={() => navigateSafely(navigation, ROUTES.DEADLIFT)}
        accessibilityLabel="Open Deadlift Training Planner"
        accessibilityHint="Weight calculator, warm-ups, safety coach and deadlift progress"
      >
        <View style={styles.planHeader}>
          <Ionicons name="barbell-outline" size={28} color={colors.accent} />
          <View style={styles.flex}>
            <Text style={styles.cardLabel}>Special planner</Text>
            <Text style={styles.cardTitle}>Deadlift Training Planner</Text>
            <Text style={styles.caption}>Calculator, warm-ups, safety coach and progress</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </FitnessCard>

      <SectionHeading title="Weekly plan" subtitle="Sample plans — your choice is saved on this device" />
      <Text style={styles.filterLabel}>Training style</Text>
      <ChipGroup
        options={PLAN_CATEGORY_OPTIONS}
        selectedId={planCategory}
        onSelect={setPlanCategory}
        accessibilityLabel="Filter plans by training style"
      />
      <Text style={styles.filterLabel}>Level</Text>
      <ChipGroup
        options={PLAN_LEVEL_OPTIONS}
        selectedId={planLevel}
        onSelect={setPlanLevel}
        accessibilityLabel="Filter plans by level"
      />
      <View style={styles.list}>
        {visiblePlans.map((option) => {
          const selected = option.id === plan.id;
          return (
            <FitnessCard
              key={option.id}
              variant={selected ? 'highlight' : 'default'}
              onPress={() => selectPlan(option)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${option.name}, ${getPlanCategoryName(option)}, ${option.daysPerWeek} days per week, ${option.level}`}
            >
              <View style={styles.planHeader}>
                <View style={styles.flex}>
                  <Text style={styles.cardLabel}>
                    {getPlanCategoryName(option)} · {option.level} · {option.daysPerWeek} days/week
                  </Text>
                  <Text style={styles.cardTitle}>{option.name}</Text>
                </View>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={selected ? colors.accent : colors.textSecondary}
                />
              </View>
              <Text style={styles.caption}>{option.description}</Text>
            </FitnessCard>
          );
        })}
      </View>

      {isAdvancedPlan ? <Notice tone="warning" title="Advanced plan" message={ADVANCED_NOTICE} /> : null}
      {plan.clearanceNotice ? <Notice {...plan.clearanceNotice} /> : null}
      {plan.safetyNotice ? <Notice {...plan.safetyNotice} /> : null}

      <SectionHeading title="This week" subtitle={plan.name} />
      <View style={styles.list}>
        {plan.schedule.map((dayId, index) => {
          const { day } = getPlanDay(plan.id, dayId);
          const isToday = index === todayIndex;
          const dayLabel = `${WEEKDAY_NAMES[index]}${isToday ? ' · Today' : ''}`;
          if (!day) {
            return (
              <FitnessCard
                key={WEEKDAY_NAMES[index]}
                style={[styles.restDay, isToday && styles.restToday]}
                accessibilityLabel={`${dayLabel}: rest and recovery day`}
              >
                <View style={styles.planHeader}>
                  <Ionicons name="moon-outline" size={22} color={colors.textSecondary} />
                  <View style={styles.flex}>
                    <Text style={[styles.cardLabel, !isToday && styles.mutedLabel]}>{dayLabel}</Text>
                    <Text style={styles.restTitle}>Rest & recovery</Text>
                    <Text style={styles.caption}>Walking, mobility or light stretching</Text>
                  </View>
                </View>
              </FitnessCard>
            );
          }
          const customised = isDayCustom(plan.id, day.id);
          return (
            <FitnessCard
              key={WEEKDAY_NAMES[index]}
              variant={isToday ? 'highlight' : 'default'}
              onPress={() => navigateSafely(navigation, ROUTES.WORKOUT_DAY, { planId: plan.id, dayId: day.id })}
              accessibilityLabel={`${dayLabel}: ${day.title}`}
              accessibilityHint="Opens workout details"
            >
              <View style={styles.planHeader}>
                <View style={styles.flex}>
                  <Text style={[styles.cardLabel, !isToday && styles.mutedLabel]}>{dayLabel}</Text>
                  <Text style={styles.cardTitle}>{day.title}</Text>
                  <Text style={styles.caption}>
                    {getDayExercisesFor(plan.id, day.id).length} exercises · about {day.estimatedMinutes} min
                    {customised ? ' · Customised' : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </FitnessCard>
          );
        })}
      </View>

      <SectionHeading title="Exercise library" subtitle={`${EXERCISES.length} exercises · search and filter`} />
      <ChipGroup
        options={MUSCLE_GROUPS}
        selectedId={null}
        onSelect={(muscleId) => navigateSafely(navigation, ROUTES.EXERCISE_LIBRARY, { muscleId })}
        accessibilityLabel="Muscle groups"
      />
      <SecondaryButton
        title="Browse all exercises"
        icon="fitness-outline"
        onPress={() => navigateSafely(navigation, ROUTES.EXERCISE_LIBRARY)}
      />
      <PrimaryButton
        title="Advanced Workout Library"
        icon="flame-outline"
        onPress={() => navigateSafely(navigation, ROUTES.EXERCISE_LIBRARY, { levelId: 'advanced' })}
      />

      <SectionHeading title={plan.notes ? 'Plan guidance & recovery' : 'Recovery guidance'} />
      <FitnessCard>
        <Text style={styles.caption}>{plan.recoveryNote}</Text>
        {(plan.notes ?? RECOVERY_GUIDANCE).map((tip) => (
          <Text key={tip} style={styles.body}>
            •  {tip}
          </Text>
        ))}
      </FitnessCard>

      {isAdvancedPlan ? (
        <>
          <SectionHeading title="Advanced technique & programming" />
          <FitnessCard>
            {ADVANCED_GUIDANCE.map((tip) => (
              <Text key={tip} style={styles.body}>
                •  {tip}
              </Text>
            ))}
          </FitnessCard>
        </>
      ) : null}

      <Notice tone="warning" title="Not medical advice" message={WORKOUT_DISCLAIMER} />
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
  filterLabel: {
    ...typography.label,
    marginBottom: -spacing.md,
  },
  body: {
    ...typography.body,
  },
  list: {
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardLabel: {
    ...typography.label,
    color: colors.accent,
  },
  mutedLabel: {
    color: colors.textSecondary,
  },
  cardTitle: {
    ...typography.subheading,
  },
  restDay: {
    gap: spacing.xs,
    borderStyle: 'dashed',
  },
  restToday: {
    borderColor: colors.textSecondary,
    borderStyle: 'solid',
  },
  restTitle: {
    ...typography.subheading,
    color: colors.textSecondary,
  },
});
