import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  RECOVERY_GUIDANCE,
  WEEKDAY_NAMES,
  WORKOUT_DISCLAIMER,
  WORKOUT_PLANS,
  getPlanById,
  getPlanDay,
  getWeekdayIndex,
} from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { colors, spacing, typography } from '../theme';
import { dateFromKey } from '../utils/date';

const PLAN_LEVEL_OPTIONS = [{ id: 'all', name: 'All' }, ...DIFFICULTY_LEVELS];

export default function WorkoutScreen({ navigation }) {
  const { settings, updateSettings, activeSession, todayKey, getDayExercisesFor, isDayCustom } = useAppState();
  const plan = getPlanById(settings.planId) ?? WORKOUT_PLANS[0];
  const todayIndex = getWeekdayIndex(dateFromKey(todayKey));
  const activeDay = activeSession ? getPlanDay(activeSession.planId, activeSession.dayId).day : null;
  const [planLevel, setPlanLevel] = useState('all');
  const visiblePlans = WORKOUT_PLANS.filter(
    (option) => planLevel === 'all' || option.level.toLowerCase() === planLevel || option.id === plan.id,
  );
  const isAdvancedPlan = plan.level === 'Advanced';

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
          <Ionicons name="barbell-outline" size={28} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.cardLabel}>Special planner</Text>
            <Text style={styles.cardTitle}>Deadlift Training Planner</Text>
            <Text style={styles.caption}>Calculator, warm-ups, safety coach and progress</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </FitnessCard>

      <SectionHeading title="Weekly plan" subtitle="Sample plans — your choice is saved on this device" />
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
              onPress={() => updateSettings({ planId: option.id })}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${option.name}, ${option.daysPerWeek} days per week, ${option.level}`}
            >
              <View style={styles.planHeader}>
                <View style={styles.flex}>
                  <Text style={styles.cardLabel}>
                    {option.level} · {option.daysPerWeek} days/week
                  </Text>
                  <Text style={styles.cardTitle}>{option.name}</Text>
                </View>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={selected ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text style={styles.caption}>{option.description}</Text>
            </FitnessCard>
          );
        })}
      </View>

      {isAdvancedPlan ? <Notice tone="warning" title="Advanced plan" message={ADVANCED_NOTICE} /> : null}

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

      <SectionHeading title="Recovery guidance" />
      <FitnessCard>
        <Text style={styles.caption}>{plan.recoveryNote}</Text>
        {RECOVERY_GUIDANCE.map((tip) => (
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
    color: colors.primary,
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
