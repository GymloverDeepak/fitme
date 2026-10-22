import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import ExerciseDemo from '../components/ExerciseDemo';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import {
  COACH_NOTICE,
  DEADLIFT_SAFETY_NOTICE,
  FREQUENCIES,
  NO_MAX_NOTICE,
  RECOVERY_GUIDANCE_DEADLIFT,
  SPLITS,
  WEEKDAYS_SHORT,
} from '../data/deadlift';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { computeProgress, getVariation, plateBreakdown, recommendNext, recoveryStatus, scheduleWarnings } from '../storage/deadliftLogic';
import { colors, layout, spacing, typography } from '../theme';
import { formatDateKey } from '../utils/date';
import { formatLoad } from '../utils/units';

function plateText(kg, plan) {
  const { perSide, exact } = plateBreakdown(kg, plan.barKg, plan.plates);
  if (perSide.length === 0) return 'Bar only';
  return `${perSide.join(' + ')} per side${exact ? '' : ' (closest possible)'}`;
}

export default function DeadliftScreen({ navigation }) {
  const {
    deadliftPlan: plan,
    updateDeadliftPlan,
    deadliftSession,
    startDeadliftSession,
    deadliftHistory,
    deleteDeadliftRecord,
    sessions,
    settings,
  } = useAppState();
  const unit = plan.displayUnit;
  const variation = getVariation(plan.variation);
  const split = SPLITS.find((item) => item.id === plan.split);
  const recommendation = recommendNext(deadliftHistory, plan);
  // "Now" is refreshed whenever the screen gains focus (e.g. coming back after a session).
  const [now, setNow] = useState(null);
  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());
    }, []),
  );
  const recovery = now === null ? { level: 'none', hours: null } : recoveryStatus({ deadliftHistory, sessions, now });
  const warnings = scheduleWarnings(plan, settings.planId);
  const progress = computeProgress(deadliftHistory);
  const last = deadliftHistory[0];
  const workingSets = plan.reducedVolume ? Math.max(1, plan.working.sets - 1) : plan.working.sets;

  const start = (type) => {
    const begin = () => {
      startDeadliftSession(type);
      navigateSafely(navigation, ROUTES.DEADLIFT_SESSION);
    };
    if (deadliftSession) {
      Alert.alert('Replace current session?', 'A deadlift session is already in progress. Starting a new one discards it.', [
        { text: 'Keep current', style: 'cancel' },
        { text: 'Discard and start', style: 'destructive', onPress: begin },
      ]);
      return;
    }
    if (recovery.level === 'warning') {
      Alert.alert(
        'Recovery warning',
        `Your last demanding posterior-chain session was about ${Math.round(recovery.hours)} hours ago. At least 48–72 hours is recommended. Start anyway?`,
        [
          { text: 'Not today', style: 'cancel' },
          { text: 'Start light session', onPress: () => { startDeadliftSession('light'); navigateSafely(navigation, ROUTES.DEADLIFT_SESSION); } },
          { text: 'Start anyway', style: 'destructive', onPress: begin },
        ],
      );
      return;
    }
    begin();
  };

  const applySuggestion = () => {
    Alert.alert(
      'Change working weight?',
      `Set your working weight to ${formatLoad(recommendation.suggestedWeightKg, unit)}? Only do this if you feel recovered and your technique is solid. You can change it back any time.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Apply', onPress: () => updateDeadliftPlan({ working: { ...plan.working, weightKg: recommendation.suggestedWeightKg } }) },
      ],
    );
  };

  const confirmDelete = (record) => {
    Alert.alert('Delete session?', `Delete the ${formatDateKey(record.dateKey)} deadlift session? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDeadliftRecord(record.id) },
    ]);
  };

  return (
    <ScreenContainer edges={STACK_EDGES}>
      <View style={styles.header}>
        <Text style={styles.label}>Deadlift Training Planner</Text>
        <Text style={styles.title} accessibilityRole="header">
          {variation.name} deadlift
        </Text>
        <Text style={styles.caption}>Conservative, technique-first strength training. Works fully offline.</Text>
      </View>

      <Notice tone="warning" title="Loads are suggestions" message={DEADLIFT_SAFETY_NOTICE} />
      {plan.painNow ? (
        <Notice
          tone="danger"
          title="You reported current pain"
          message="Heavy deadlifts are not recommended while you have pain. Keep any work light and pain-free, and consider a qualified professional."
        />
      ) : null}

      {deadliftSession ? (
        <FitnessCard variant="highlight">
          <Text style={styles.label}>Session in progress</Text>
          <Text style={styles.cardTitle}>{getVariation(deadliftSession.variation).name} deadlift</Text>
          <PrimaryButton title="Resume Session" icon="play" onPress={() => navigateSafely(navigation, ROUTES.DEADLIFT_SESSION)} />
        </FitnessCard>
      ) : null}

      <SectionHeading title="Planned session" subtitle={`${split?.name ?? ''} · ${split?.dayLabel ?? ''} · ${WEEKDAYS_SHORT[plan.deadliftWeekday].name}`} />
      <FitnessCard>
        <Text style={styles.big}>
          {formatLoad(plan.working.weightKg, unit)} × {plan.working.reps} reps × {workingSets} sets
        </Text>
        <Text style={styles.caption}>
          Rest {Math.round(plan.working.restSeconds / 60)} min ({plan.working.restSeconds}s) · Target RPE {plan.working.targetRpe} — several good reps left in reserve
          {plan.reducedVolume ? ' · Reduced volume on' : ''}
        </Text>
        <Text style={styles.caption}>Plates: {plateText(plan.working.weightKg, plan)} ({plan.barKg} kg bar)</Text>

        <Text style={[styles.label, styles.tableTitle]}>Warm-up sets (not counted)</Text>
        {plan.warmups.length === 0 ? <Text style={styles.caption}>No warm-up sets set — add some in the planner.</Text> : null}
        {plan.warmups.map((warmup, index) => (
          <View key={`${warmup.weightKg}-${index}`} style={styles.tableRow}>
            <Text style={styles.tableCell}>W{index + 1}</Text>
            <Text style={[styles.tableCell, styles.tableMain]}>
              {formatLoad(warmup.weightKg, unit)} × {warmup.reps}
            </Text>
            <Text style={[styles.tableCell, styles.tablePlates]}>{plateText(warmup.weightKg, plan)}</Text>
          </View>
        ))}
        <Text style={[styles.label, styles.tableTitle]}>Working sets</Text>
        {Array.from({ length: workingSets }, (_, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>S{index + 1}</Text>
            <Text style={[styles.tableCell, styles.tableMain, styles.accent]}>
              {formatLoad(plan.working.weightKg, unit)} × {plan.working.reps}
            </Text>
            <Text style={[styles.tableCell, styles.tablePlates]}>RPE {plan.working.targetRpe}</Text>
          </View>
        ))}
      </FitnessCard>

      {recovery.level === 'warning' || recovery.level === 'caution' ? (
        <Notice
          tone={recovery.level === 'warning' ? 'danger' : 'warning'}
          title={recovery.level === 'warning' ? 'Too soon for heavy deadlifts' : 'Recovery check'}
          message={`Your last demanding posterior-chain session was about ${Math.round(recovery.hours)} hours ago. Allow at least 48–72 hours, more if you are still sore or tired.`}
        />
      ) : null}
      {warnings.map((warning) => (
        <Notice key={warning} tone="warning" title="Schedule" message={warning} />
      ))}

      <PrimaryButton title="Start deadlift session" icon="play" onPress={() => start('heavy')} disabled={plan.painNow} />
      <SecondaryButton title="Start light / technique session (−20%)" icon="leaf-outline" onPress={() => start('light')} />
      <SecondaryButton title="Edit plan, calculator & schedule" icon="create-outline" onPress={() => navigateSafely(navigation, ROUTES.DEADLIFT_SETUP)} />

      <SectionHeading title="Next-session recommendation" />
      <Notice tone={recommendation.tone} title={recommendation.title} message={recommendation.message} />
      {recommendation.suggestedWeightKg ? (
        <SecondaryButton
          title={`Apply ${formatLoad(recommendation.suggestedWeightKg, unit)} (your choice)`}
          icon="checkmark"
          onPress={applySuggestion}
        />
      ) : null}
      <SecondaryButton
        title={plan.reducedVolume ? 'Reduced volume is ON — tap to turn off' : 'Recovery poor? Use reduced volume (one fewer set)'}
        icon="battery-half-outline"
        onPress={() => updateDeadliftPlan({ reducedVolume: !plan.reducedVolume })}
      />

      <SectionHeading title="Previous session" />
      {last ? (
        <FitnessCard
          onPress={() => navigateSafely(navigation, ROUTES.DEADLIFT_SUMMARY, { recordId: last.id })}
          accessibilityLabel={`Previous session on ${formatDateKey(last.dateKey)}`}
          accessibilityHint="Opens the session summary"
        >
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>
                {formatDateKey(last.dateKey)} · {getVariation(last.variation).name}
                {last.type === 'light' ? ' (light)' : ''}
              </Text>
              <Text style={styles.caption}>
                {last.working.filter((set) => set.done).length}/{last.working.length} working sets · top set{' '}
                {formatLoad(last.topSetKg, unit)}
                {last.stopReason ? ` · stopped early (${last.stopReason})` : ''}
              </Text>
              {last.notes ? <Text style={styles.caption}>“{last.notes}”</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        </FitnessCard>
      ) : (
        <Text style={styles.caption}>No deadlift sessions saved yet.</Text>
      )}

      <SectionHeading title="Progress & personal records" subtitle="Estimates are approximate — never a max to test" />
      <StatRow>
        <StatCard label="Sessions" value={String(deadliftHistory.length)} />
        <StatCard
          label="Best est. strength"
          value={progress.bestEstimate ? formatLoad(progress.bestEstimate.value, unit) : '—'}
          caption={progress.bestEstimate ? formatDateKey(progress.bestEstimate.dateKey) : 'Log RPE to see this'}
        />
      </StatRow>
      {Object.keys(progress.heaviestByReps).length > 0 ? (
        <FitnessCard>
          <Text style={styles.label}>Heaviest completed working sets</Text>
          {Object.entries(progress.heaviestByReps)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([reps, pr]) => (
              <View key={reps} style={styles.rowBetween}>
                <Text style={styles.body}>{reps} rep{reps === '1' ? '' : 's'}</Text>
                <Text style={styles.accent}>
                  {formatLoad(pr.weightKg, unit)} · {formatDateKey(pr.dateKey)}
                </Text>
              </View>
            ))}
        </FitnessCard>
      ) : null}
      {progress.trend.length > 1 ? (
        <FitnessCard>
          <Text style={styles.label}>Strength trend (latest 8)</Text>
          {progress.trend.slice(-8).map((point, index) => (
            <View key={`${point.dateKey}-${index}`} style={styles.rowBetween}>
              <Text style={styles.body}>{formatDateKey(point.dateKey)}</Text>
              <Text style={styles.caption}>
                top {formatLoad(point.topSetKg, unit)} · est. {point.e1rmKg ? formatLoad(point.e1rmKg, unit) : '—'}
              </Text>
            </View>
          ))}
        </FitnessCard>
      ) : null}

      {deadliftHistory.length > 0 ? (
        <>
          <SectionHeading title="History" />
          {deadliftHistory.slice(0, 15).map((record) => (
            <View key={record.id} style={styles.historyRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Deadlift session ${formatDateKey(record.dateKey)}`}
                onPress={() => navigateSafely(navigation, ROUTES.DEADLIFT_SUMMARY, { recordId: record.id })}
                style={({ pressed }) => [styles.historyMain, pressed && styles.pressed]}
              >
                <Text style={styles.body}>{formatDateKey(record.dateKey)}</Text>
                <Text style={styles.caption}>
                  {getVariation(record.variation).name} · top {formatLoad(record.topSetKg, unit)}
                  {record.stopReason ? ' · stopped early' : ''}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete deadlift session ${formatDateKey(record.dateKey)}`}
                onPress={() => confirmDelete(record)}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </>
      ) : null}

      <SectionHeading title="Technique" />
      <ExerciseDemo exerciseId={variation.exerciseId} name={`${variation.name} deadlift`} size={220} />

      <SectionHeading title="Recovery & progression" subtitle={FREQUENCIES.find((item) => item.id === plan.frequency)?.name} />
      <FitnessCard>
        {RECOVERY_GUIDANCE_DEADLIFT.map((tip) => (
          <Text key={tip} style={styles.body}>
            •  {tip}
          </Text>
        ))}
      </FitnessCard>
      <Notice title="No max testing" message={NO_MAX_NOTICE} />
      <Notice title="Learn from a coach" message={COACH_NOTICE} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.primary,
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
  big: {
    ...typography.heading,
    color: colors.primary,
  },
  cardTitle: {
    ...typography.subheading,
  },
  accent: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  tableTitle: {
    marginTop: spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tableCell: {
    ...typography.body,
    width: 32,
  },
  tableMain: {
    ...typography.bodyStrong,
    width: undefined,
    flex: 1,
  },
  tablePlates: {
    ...typography.caption,
    width: undefined,
    flex: 1.3,
    textAlign: 'right',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyMain: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
  },
  deleteButton: {
    width: layout.minTouchTarget + 8,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.cardPressed,
  },
});
