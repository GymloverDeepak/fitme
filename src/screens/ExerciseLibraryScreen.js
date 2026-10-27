import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChipGroup from '../components/ChipGroup';
import EmptyState from '../components/EmptyState';
import { ExerciseThumbnail } from '../components/ExerciseDemo';
import ExerciseRow from '../components/ExerciseRow';
import Notice from '../components/Notice';
import SearchField from '../components/SearchField';
import SecondaryButton from '../components/SecondaryButton';
import { STACK_EDGES } from '../components/ScreenContainer';
import {
  ADVANCED_NOTICE,
  DIFFICULTY_LEVELS,
  EQUIPMENT_TYPES,
  MUSCLE_GROUPS,
  filterExercises,
  getLevelNames,
  getMuscleGroupById,
  getPlanDay,
} from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { colors, layout, spacing, typography } from '../theme';

const ALL = { id: 'all', name: 'All' };
const LEVEL_OPTIONS = [ALL, ...DIFFICULTY_LEVELS];
const MUSCLE_OPTIONS = [ALL, ...MUSCLE_GROUPS];
const EQUIPMENT_OPTIONS = [ALL, ...EQUIPMENT_TYPES];

function pickValid(options, id) {
  return options.some((option) => option.id === id) ? id : 'all';
}

// Searchable library. With route.params.pickFor = { planId, dayId } it becomes an "add to workout" picker.
export default function ExerciseLibraryScreen({ navigation, route }) {
  const params = route.params ?? {};
  const pickFor = params.pickFor && getPlanDay(params.pickFor.planId, params.pickFor.dayId).day ? params.pickFor : null;
  const { getDayExercisesFor, addExerciseToDay } = useAppState();

  const [query, setQuery] = useState('');
  const [levelId, setLevelId] = useState(() => pickValid(LEVEL_OPTIONS, params.levelId));
  const [muscleId, setMuscleId] = useState(() => pickValid(MUSCLE_OPTIONS, params.muscleId));
  const [equipmentId, setEquipmentId] = useState('all');
  const [addedMessage, setAddedMessage] = useState(null);

  const results = filterExercises({ query, muscleId, equipmentId, levelId });
  const inDay = new Set(pickFor ? getDayExercisesFor(pickFor.planId, pickFor.dayId).map((exercise) => exercise.id) : []);
  const hasFilters = query !== '' || levelId !== 'all' || muscleId !== 'all' || equipmentId !== 'all';

  const clearFilters = () => {
    setQuery('');
    setLevelId('all');
    setMuscleId('all');
    setEquipmentId('all');
  };

  const handleAdd = (exercise) => {
    const added = addExerciseToDay(pickFor.planId, pickFor.dayId, exercise.id);
    setAddedMessage(
      added ? `${exercise.name} added to this workout.` : `${exercise.name} could not be added (already added or the day is full).`,
    );
  };

  const header = (
    <View style={styles.header}>
      {pickFor ? (
        <Notice title="Add exercises" message="Tap + to add an exercise to the workout day. Tap a name to see how to do it." />
      ) : null}
      {addedMessage ? <Notice message={addedMessage} onDismiss={() => setAddedMessage(null)} /> : null}

      <SearchField value={query} onChangeText={setQuery} placeholder="Search exercises by name" />

      <View style={styles.group}>
        <Text style={styles.label}>Difficulty</Text>
        <ChipGroup options={LEVEL_OPTIONS} selectedId={levelId} onSelect={setLevelId} accessibilityLabel="Difficulty" />
      </View>
      {levelId === 'advanced' ? <Notice tone="warning" title="Advanced" message={ADVANCED_NOTICE} /> : null}
      <View style={styles.group}>
        <Text style={styles.label}>Muscle group</Text>
        <ChipGroup options={MUSCLE_OPTIONS} selectedId={muscleId} onSelect={setMuscleId} accessibilityLabel="Muscle group" />
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>Equipment</Text>
        <ChipGroup options={EQUIPMENT_OPTIONS} selectedId={equipmentId} onSelect={setEquipmentId} accessibilityLabel="Equipment" />
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText} accessibilityLiveRegion="polite">
          {results.length} exercise{results.length === 1 ? '' : 's'}
        </Text>
        {hasFilters ? <SecondaryButton title="Clear filters" icon="close" onPress={clearFilters} style={styles.clearButton} /> : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={STACK_EDGES}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No exercises found"
            message="Try a different name or remove a filter."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        }
        renderItem={({ item }) => (
          <ExerciseRow
            thumbnail={<ExerciseThumbnail exerciseId={item.id} name={item.name} size={52} />}
            name={item.name}
            detail={`${getLevelNames(item).join(' · ')} · ${getMuscleGroupById(item.muscle)?.name ?? ''} · ${item.equipment}`}
            onPress={() => navigateSafely(navigation, ROUTES.EXERCISE_DETAILS, { exerciseId: item.id })}
            {...(pickFor
              ? {
                  actionIcon: inDay.has(item.id) ? 'checkmark-circle' : 'add-circle-outline',
                  actionLabel: inDay.has(item.id) ? `${item.name} is already in this workout` : `Add ${item.name} to workout`,
                  actionDisabled: inDay.has(item.id),
                  onActionPress: () => handleAdd(item),
                }
              : {})}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={10}
        windowSize={7}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.accent,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  resultsText: {
    ...typography.bodyStrong,
  },
  clearButton: {
    minHeight: layout.minTouchTarget,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
});
