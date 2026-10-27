import { StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import { RECOVERY_GUIDANCE_DEADLIFT, STOP_REASONS, TECHNIQUE_OPTIONS } from '../data/deadlift';
import { getExerciseById } from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { getVariation, recommendNext } from '../storage/deadliftLogic';
import { colors, spacing, typography } from '../theme';
import { formatDateKey, formatDuration } from '../utils/date';
import { formatLoad } from '../utils/units';

export default function DeadliftSummaryScreen({ navigation, route }) {
  const { deadliftHistory, deadliftPlan: plan } = useAppState();
  const record = deadliftHistory.find((item) => item.id === route.params?.recordId);

  if (!record) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState
          icon="alert-circle-outline"
          title="Session not found"
          message="This deadlift session is no longer on this device."
          actionLabel="Open Deadlift Planner"
          onAction={() => navigateSafely(navigation, ROUTES.DEADLIFT)}
        />
      </ScreenContainer>
    );
  }

  const unit = plan.displayUnit;
  const done = record.working.filter((set) => set.done);
  const stop = STOP_REASONS.find((reason) => reason.id === record.stopReason);
  const recommendation = recommendNext(deadliftHistory, plan);

  return (
    <ScreenContainer edges={STACK_EDGES}>
      <FitnessCard variant="accent">
        <Text style={styles.heroLabel}>{stop ? 'Session stopped early' : 'Session saved'}</Text>
        <Text style={styles.heroTitle} accessibilityRole="header">
          {getVariation(record.variation).name} deadlift{record.type === 'light' ? ' (light)' : ''}
        </Text>
        <Text style={styles.heroCaption}>{formatDateKey(record.dateKey)}</Text>
      </FitnessCard>

      {stop ? (
        <Notice
          tone={stop.id === 'pain' ? 'danger' : 'warning'}
          title={`Stopped: ${stop.name}`}
          message={
            stop.id === 'pain'
              ? 'Do not continue heavy deadlifts while you have pain. If it persists or is severe, consult a qualified professional.'
              : 'Stopping when things do not feel right is good training. Use a lighter load next time.'
          }
        />
      ) : null}

      <StatRow>
        <StatCard label="Working sets" value={`${done.length}/${record.working.length}`} />
        <StatCard label="Top set" value={formatLoad(record.topSetKg, unit)} />
        <StatCard label="Duration" value={formatDuration((record.finishedAt - record.startedAt) / 1000)} />
      </StatRow>
      {record.e1rmKg ? (
        <Text style={styles.caption}>
          Estimated strength from today’s sets ≈ {formatLoad(record.e1rmKg, unit)} (approximate, based on your RPE — not a max to test).
        </Text>
      ) : null}

      <SectionHeading title="Sets" />
      <FitnessCard>
        {record.warmups.map((set, index) => (
          <Row key={`w${index}`} label={`W${index + 1}`} text={`${formatLoad(set.weightKg, unit)} × ${set.reps}`} detail={set.done ? 'done' : 'not done'} muted />
        ))}
        {record.working.map((set, index) => (
          <Row
            key={`s${index}`}
            label={`S${index + 1}`}
            text={`${formatLoad(set.weightKg, unit)} × ${set.reps}`}
            detail={set.done ? `done${Number.isFinite(set.rpe) ? ` · RPE ${set.rpe}` : ''}` : 'not done'}
          />
        ))}
      </FitnessCard>

      {record.accessories.length > 0 ? (
        <>
          <SectionHeading title="Accessories" />
          <FitnessCard>
            {record.accessories.map((item) => (
              <Row
                key={item.exerciseId}
                label=""
                text={getExerciseById(item.exerciseId)?.name ?? 'Exercise'}
                detail={item.skipped ? 'skipped' : `${item.setsDone}/${item.sets} sets`}
                muted={item.skipped}
              />
            ))}
          </FitnessCard>
        </>
      ) : null}

      {record.technique || record.notes ? (
        <FitnessCard>
          {record.technique ? (
            <Text style={styles.body}>Technique: {TECHNIQUE_OPTIONS.find((option) => option.id === record.technique)?.name}</Text>
          ) : null}
          {record.notes ? <Text style={styles.caption}>“{record.notes}”</Text> : null}
        </FitnessCard>
      ) : null}

      <SectionHeading title="Next session" />
      <Notice tone={recommendation.tone} title={recommendation.title} message={recommendation.message} />
      <FitnessCard>
        {RECOVERY_GUIDANCE_DEADLIFT.slice(0, 2).map((tip) => (
          <Text key={tip} style={styles.body}>
            •  {tip}
          </Text>
        ))}
      </FitnessCard>

      <PrimaryButton title="Back to Deadlift Planner" icon="barbell-outline" onPress={() => navigateSafely(navigation, ROUTES.DEADLIFT)} />
    </ScreenContainer>
  );
}

function Row({ label, text, detail, muted }) {
  return (
    <View style={styles.row}>
      {label ? <Text style={styles.rowLabel}>{label}</Text> : null}
      <Text style={[styles.rowText, muted && styles.muted]}>{text}</Text>
      <Text style={styles.caption}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroLabel: {
    ...typography.label,
    color: colors.onAccent,
  },
  heroTitle: {
    ...typography.title,
    color: colors.onAccent,
  },
  heroCaption: {
    ...typography.caption,
    color: colors.onAccent,
  },
  caption: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 32,
  },
  rowLabel: {
    ...typography.bodyStrong,
    width: 28,
  },
  rowText: {
    ...typography.bodyStrong,
    flex: 1,
  },
  muted: {
    color: colors.textSecondary,
  },
});
