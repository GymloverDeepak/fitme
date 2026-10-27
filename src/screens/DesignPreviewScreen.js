import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ChipGroup from '../components/ChipGroup';
import EmptyState from '../components/EmptyState';
import ExerciseRow from '../components/ExerciseRow';
import FitnessCard from '../components/FitnessCard';
import MealCard from '../components/MealCard';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import { colors, radius, spacing, typography } from '../theme';

// Temporary developer screen showing every reusable component with demo content.
// Reached from Settings → Developer, which is only shown in development builds.
const SWATCHES = [
  ['Background', colors.background],
  ['Background 2', colors.backgroundSecondary],
  ['Surface', colors.surface],
  ['Elevated', colors.surfaceElevated],
  ['Accent', colors.accent],
  ['Text', colors.textPrimary],
  ['Secondary', colors.textSecondary],
  ['Border', colors.border],
  ['Success', colors.success],
  ['Warning', colors.warning],
  ['Error', colors.error],
];

export default function DesignPreviewScreen() {
  const [lastAction, setLastAction] = useState('Tap any control');
  const [done, setDone] = useState({ a: true, b: false });
  const [chip, setChip] = useState('one');

  return (
    <ScreenContainer edges={STACK_EDGES}>
      <Notice title="Demo content" message={`All values on this screen are examples. Last action: ${lastAction}`} />

      <SectionHeading title="Colours" />
      <View style={styles.swatchGrid}>
        {SWATCHES.map(([name, color]) => (
          <View key={name} style={styles.swatchItem}>
            <View style={[styles.swatch, { backgroundColor: color }]} />
            <Text style={styles.caption}>{name}</Text>
            <Text style={styles.caption}>{color}</Text>
          </View>
        ))}
      </View>

      <SectionHeading title="Typography" />
      <FitnessCard>
        {Object.entries(typography).map(([name, style]) => (
          <Text key={name} style={[style, !style.color && styles.whiteText]}>
            {name} — FITME
          </Text>
        ))}
      </FitnessCard>

      <SectionHeading title="Buttons" actionLabel="Section action" onActionPress={() => setLastAction('Section action')} />
      <PrimaryButton title="Primary button" icon="play" onPress={() => setLastAction('Primary')} />
      <SecondaryButton title="Secondary button" onPress={() => setLastAction('Secondary')} />
      <SecondaryButton title="Danger button" tone="danger" icon="trash-outline" onPress={() => setLastAction('Danger')} />
      <PrimaryButton title="Disabled button" disabled onPress={() => {}} />

      <SectionHeading title="Chips" />
      <ChipGroup
        options={[
          { id: 'one', name: 'Option one' },
          { id: 'two', name: 'Option two' },
          { id: 'three', name: 'Option three' },
        ]}
        selectedId={chip}
        onSelect={setChip}
        accessibilityLabel="Demo options"
      />

      <SectionHeading title="Cards" />
      <FitnessCard>
        <Text style={styles.body}>Default card</Text>
      </FitnessCard>
      <FitnessCard variant="highlight" onPress={() => setLastAction('Highlight card')} accessibilityLabel="Highlight card">
        <Text style={styles.body}>Highlighted, pressable card</Text>
      </FitnessCard>
      <FitnessCard variant="accent">
        <Text style={[styles.body, styles.darkText]}>Accent card</Text>
      </FitnessCard>

      <SectionHeading title="Stat cards" />
      <StatRow>
        <StatCard label="Demo stat" value="12" unit="units" caption="Example only" />
        <StatCard label="Another" value="3/5" caption="Example only" />
      </StatRow>

      <SectionHeading title="Exercise rows" />
      <ExerciseRow
        index={0}
        name="Demo exercise A"
        detail="3 sets × 10"
        completed={done.a}
        onToggle={() => setDone((current) => ({ ...current, a: !current.a }))}
        onInfoPress={() => setLastAction('Info A')}
      />
      <ExerciseRow
        index={1}
        name="Demo exercise B"
        detail="3 sets × 12"
        completed={done.b}
        onToggle={() => setDone((current) => ({ ...current, b: !current.b }))}
      />
      <ExerciseRow name="Link-style row" detail="Opens details" onPress={() => setLastAction('Link row')} />

      <SectionHeading title="Meal card" />
      <MealCard
        category="Breakfast"
        name="Demo meal"
        description="Example items"
        calories={400}
        protein={20}
        onPress={() => setLastAction('Meal card')}
      />

      <SectionHeading title="Notices" />
      <Notice message="Info notice" />
      <Notice tone="warning" title="Warning" message="Warning notice" />
      <Notice tone="danger" message="Danger notice" />

      <SectionHeading title="Empty state" />
      <EmptyState
        title="Nothing here yet"
        message="Empty states explain what is missing and offer a next step."
        actionLabel="Do something"
        onAction={() => setLastAction('Empty state action')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatchItem: {
    width: 96,
    gap: 2,
  },
  swatch: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  caption: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
  },
  whiteText: {
    color: colors.textPrimary,
  },
  darkText: {
    color: colors.onAccent,
  },
});
