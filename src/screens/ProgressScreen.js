import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import NumberField from '../components/NumberField';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import WaterTracker from '../components/WaterTracker';
import { getExerciseById } from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { GLASS_SIZE_ML } from '../storage/sanitize';
import { colors, layout, spacing, typography } from '../theme';
import { dateFromKey, formatDateKey, formatDuration, getRecentDateKeys, getStartOfWeek } from '../utils/date';
import { formatLength, formatWeight, kgToUnit } from '../utils/units';
import { MEASUREMENT_FIELDS, validateMeasurements, validateWeight } from '../utils/validation';

const STORAGE_ISSUE_MESSAGES = {
  unavailable: 'Local storage could not be opened. Changes may not be kept after the app closes.',
  repaired: 'Some saved data could not be read and was skipped. Everything else loaded normally.',
  saveFailed: 'The last change could not be saved on this device. Please try again.',
};

const EMPTY_MEASUREMENTS = { chest: '', waist: '', arm: '', thigh: '' };

function DeleteButton({ label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}
    >
      <Ionicons name="trash-outline" size={20} color={colors.danger} />
    </Pressable>
  );
}

function confirmDelete(description, onConfirm) {
  Alert.alert('Delete entry?', `Remove the ${description}? This cannot be undone.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function ProgressScreen({ navigation }) {
  const {
    todayKey,
    settings,
    storageIssue,
    dismissStorageIssue,
    sessions,
    water,
    weights,
    saveWeight,
    deleteWeight,
    measurements,
    saveMeasurements,
    deleteMeasurement,
  } = useAppState();
  const { weightUnit, lengthUnit } = settings;

  const [weightText, setWeightText] = useState('');
  const [weightError, setWeightError] = useState(null);
  const [measurementText, setMeasurementText] = useState(EMPTY_MEASUREMENTS);
  const [measurementErrors, setMeasurementErrors] = useState({});
  const [measurementFormError, setMeasurementFormError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(null);

  const weekStart = getStartOfWeek(dateFromKey(todayKey));
  const sessionsThisWeek = sessions.filter((session) => session.finishedAt >= weekStart).length;
  const totalExercisesDone = sessions.reduce((sum, session) => sum + session.completedExerciseIds.length, 0);

  // Most-completed exercises across all saved sessions.
  const exerciseCounts = {};
  for (const session of sessions) {
    for (const id of session.completedExerciseIds) exerciseCounts[id] = (exerciseCounts[id] ?? 0) + 1;
  }
  const topExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({ name: getExerciseById(id)?.name ?? 'Removed exercise', count }));

  const latestWeight = weights[0];
  const firstWeight = weights[weights.length - 1];
  const weightChange =
    latestWeight && firstWeight && latestWeight !== firstWeight
      ? kgToUnit(latestWeight.kg - firstWeight.kg, weightUnit)
      : null;

  const handleSaveWeight = () => {
    const result = validateWeight(weightText, weightUnit);
    setWeightError(result.error);
    if (result.error) return;
    saveWeight(result.kg);
    setWeightText('');
    Keyboard.dismiss();
    setSavedMessage(`Weight saved for ${formatDateKey(todayKey)}.`);
  };

  const handleSaveMeasurements = () => {
    const result = validateMeasurements(measurementText, lengthUnit);
    setMeasurementErrors(result.errors);
    setMeasurementFormError(result.formError);
    if (result.formError || Object.keys(result.errors).length > 0) return;
    saveMeasurements(result.valuesCm);
    setMeasurementText(EMPTY_MEASUREMENTS);
    Keyboard.dismiss();
    setSavedMessage(`Measurements saved for ${formatDateKey(todayKey)}.`);
  };

  return (
    <ScreenContainer keyboardAware>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Progress
        </Text>
        <Text style={styles.caption}>Everything here is stored only on this phone. It is not synced or backed up.</Text>
      </View>

      {storageIssue ? (
        <Notice tone="danger" message={STORAGE_ISSUE_MESSAGES[storageIssue]} onDismiss={dismissStorageIssue} />
      ) : null}
      {savedMessage ? <Notice message={savedMessage} onDismiss={() => setSavedMessage(null)} /> : null}

      {/* Overview */}
      <StatRow>
        <StatCard label="Sessions" value={String(sessions.length)} caption="All time" />
        <StatCard label="This week" value={String(sessionsThisWeek)} caption="Since Monday" />
        <StatCard label="Exercises" value={String(totalExercisesDone)} caption="Completed" />
      </StatRow>

      {/* Water */}
      <SectionHeading title="Water" />
      <WaterTracker />
      <FitnessCard>
        <Text style={styles.label}>Last 7 days</Text>
        {getRecentDateKeys(7, dateFromKey(todayKey)).map((dateKey) => {
          const glasses = water[dateKey] ?? 0;
          return (
            <View key={dateKey} style={styles.historyRow}>
              <Text style={styles.body}>{dateKey === todayKey ? 'Today' : formatDateKey(dateKey)}</Text>
              <Text style={[styles.body, glasses >= settings.waterGoalGlasses && styles.accentText]}>
                {glasses} glasses · {glasses * GLASS_SIZE_ML} ml
              </Text>
            </View>
          );
        })}
      </FitnessCard>

      {/* Body weight */}
      <SectionHeading title="Body weight" subtitle="One entry per day — saving again today replaces it" />
      <FitnessCard>
        <NumberField
          label="Today’s weight"
          value={weightText}
          onChangeText={(text) => {
            setWeightText(text);
            if (weightError) setWeightError(null);
          }}
          unit={weightUnit}
          placeholder={weightUnit === 'kg' ? 'e.g. 72.5' : 'e.g. 160'}
          error={weightError}
          onSubmitEditing={handleSaveWeight}
        />
        <PrimaryButton title="Save weight" icon="scale-outline" onPress={handleSaveWeight} />
        {weightChange !== null ? (
          <Text style={styles.caption}>
            Change since first entry: {weightChange > 0 ? '+' : ''}
            {weightChange.toFixed(1)} {weightUnit}
          </Text>
        ) : null}
      </FitnessCard>
      {weights.length === 0 ? (
        <EmptyState icon="scale-outline" title="No weight entries yet" message="Add today’s weight above to start tracking." />
      ) : (
        <FitnessCard>
          <Text style={styles.label}>Recent entries</Text>
          {weights.slice(0, 10).map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <Text style={styles.body}>{formatDateKey(entry.date)}</Text>
              <View style={styles.rowEnd}>
                <Text style={styles.bodyStrong}>{formatWeight(entry.kg, weightUnit)}</Text>
                <DeleteButton
                  label={`Delete weight entry for ${formatDateKey(entry.date)}`}
                  onPress={() => confirmDelete(`weight entry for ${formatDateKey(entry.date)}`, () => deleteWeight(entry.id))}
                />
              </View>
            </View>
          ))}
        </FitnessCard>
      )}

      {/* Measurements */}
      <SectionHeading title="Body measurements" subtitle="Optional — fill in any you want to track" />
      <FitnessCard>
        <View style={styles.fieldGrid}>
          {MEASUREMENT_FIELDS.map((field) => (
            <NumberField
              key={field.id}
              label={field.label}
              value={measurementText[field.id]}
              onChangeText={(text) => {
                setMeasurementText((current) => ({ ...current, [field.id]: text }));
                if (measurementErrors[field.id] || measurementFormError) {
                  setMeasurementErrors((current) => ({ ...current, [field.id]: undefined }));
                  setMeasurementFormError(null);
                }
              }}
              unit={lengthUnit}
              error={measurementErrors[field.id]}
            />
          ))}
        </View>
        {measurementFormError ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {measurementFormError}
          </Text>
        ) : null}
        <PrimaryButton title="Save measurements" icon="resize-outline" onPress={handleSaveMeasurements} />
      </FitnessCard>
      {measurements.length > 0 ? (
        <FitnessCard>
          <Text style={styles.label}>Recent measurements</Text>
          {measurements.slice(0, 5).map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View style={styles.flex}>
                <Text style={styles.bodyStrong}>{formatDateKey(entry.date)}</Text>
                <Text style={styles.caption}>
                  {MEASUREMENT_FIELDS.filter((field) => entry[field.id] != null)
                    .map((field) => `${field.label} ${formatLength(entry[field.id], lengthUnit)}`)
                    .join(' · ')}
                </Text>
              </View>
              <DeleteButton
                label={`Delete measurements for ${formatDateKey(entry.date)}`}
                onPress={() =>
                  confirmDelete(`measurements for ${formatDateKey(entry.date)}`, () => deleteMeasurement(entry.id))
                }
              />
            </View>
          ))}
        </FitnessCard>
      ) : null}

      {/* Workout history */}
      <SectionHeading title="Workout history" />
      {sessions.length === 0 ? (
        <EmptyState
          icon="barbell-outline"
          title="No workouts saved yet"
          message="Finish a workout session and it will appear here."
          actionLabel="Go to Workout"
          onAction={() => navigateSafely(navigation, ROUTES.WORKOUT)}
        />
      ) : (
        <>
          {topExercises.length > 0 ? (
            <FitnessCard>
              <Text style={styles.label}>Most completed exercises</Text>
              {topExercises.map((item) => (
                <View key={item.name} style={styles.historyRow}>
                  <Text style={styles.body}>{item.name}</Text>
                  <Text style={styles.accentText}>{item.count}×</Text>
                </View>
              ))}
            </FitnessCard>
          ) : null}
          <View style={styles.list}>
            {sessions.slice(0, 10).map((session) => (
              <FitnessCard
                key={session.id}
                onPress={() => navigateSafely(navigation, ROUTES.SESSION_SUMMARY, { sessionId: session.id })}
                accessibilityLabel={`${session.dayTitle} on ${formatDateKey(session.dateKey)}`}
                accessibilityHint="Opens the session summary"
              >
                <View style={styles.historyRow}>
                  <View style={styles.flex}>
                    <Text style={styles.bodyStrong}>{session.dayTitle}</Text>
                    <Text style={styles.caption}>
                      {formatDateKey(session.dateKey)} · {formatDuration((session.finishedAt - session.startedAt) / 1000)}
                    </Text>
                  </View>
                  <Text style={styles.accentText}>
                    {session.completedExerciseIds.length}/{session.totalExercises}
                  </Text>
                </View>
              </FitnessCard>
            ))}
          </View>
        </>
      )}
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
  label: {
    ...typography.label,
    color: colors.primary,
  },
  body: {
    ...typography.body,
  },
  bodyStrong: {
    ...typography.bodyStrong,
  },
  accentText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 32,
  },
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  deleteButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: layout.minTouchTarget / 2,
  },
  deletePressed: {
    backgroundColor: colors.dangerSoft,
  },
});
