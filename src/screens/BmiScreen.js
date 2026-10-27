import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import ChipGroup from '../components/ChipGroup';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import NumberField from '../components/NumberField';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SectionHeading from '../components/SectionHeading';
import { useAppState } from '../storage/AppStateContext';
import { colors, radius, spacing, typography } from '../theme';
import { BMI_CATEGORIES, calculateBmi, classifyAdultBmi, parseBmiInputs, roundBmi } from '../utils/bmi';
import { formatDateKey } from '../utils/date';

const HEIGHT_MODES = [
  { id: 'cm', name: 'Centimetres' },
  { id: 'ftin', name: 'Feet & inches' },
];

const GROUPS = [
  { id: 'adult', name: 'Adult (18+)' },
  { id: 'under18', name: 'Under 18' },
  { id: 'pregnant', name: 'Pregnant' },
];

const TONE_COLORS = { success: colors.success, warning: colors.warning, error: colors.error };

const SCREENING_NOTE =
  'BMI is a quick screening tool, not a diagnosis. It does not measure body fat directly, so it can overestimate ' +
  'fat in muscular athletes and underestimate it in people with little muscle. A health professional can give a ' +
  'fuller assessment (for example waist size, body composition and overall health).';

const GROUP_NOTES = {
  under18:
    'Adult categories are not used for children and teenagers. Their BMI is read with age- and sex-specific growth ' +
    'charts (BMI-for-age percentiles). Ask a doctor or nurse to interpret it.',
  pregnant:
    'Adult BMI categories do not apply during pregnancy. Clinicians usually use pre-pregnancy BMI to guide advice, ' +
    'so please ask your obstetric clinician or midwife.',
};

// BMI calculator. Nothing is saved: the result is shown on screen only. If a body weight has been
// logged on the Progress tab, the latest one pre-fills the weight field.
export default function BmiScreen() {
  const { weights } = useAppState();
  const latestWeight = weights[0] ?? null;

  const [weightText, setWeightText] = useState(latestWeight ? String(Number(latestWeight.kg.toFixed(1))) : '');
  const [heightMode, setHeightMode] = useState('cm');
  const [cmText, setCmText] = useState('');
  const [feetText, setFeetText] = useState('');
  const [inchesText, setInchesText] = useState('');
  const [group, setGroup] = useState('adult');
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  // Any edit hides the previous result so it never shows a value for old inputs.
  const edit = (setter) => (text) => {
    setter(text);
    setResult(null);
    setErrors({});
  };

  const handleCalculate = () => {
    const parsed = parseBmiInputs({ weightText, heightMode, cmText, feetText, inchesText });
    setErrors(parsed.errors);
    if (Object.keys(parsed.errors).length > 0) {
      setResult(null);
      return;
    }
    Keyboard.dismiss();
    setResult({ bmi: calculateBmi(parsed.weightKg, parsed.heightCm), heightCm: parsed.heightCm });
  };

  const category = result && group === 'adult' ? classifyAdultBmi(result.bmi) : null;

  return (
    <ScreenContainer edges={STACK_EDGES} keyboardAware>
      <View style={styles.header}>
        <Text style={styles.label}>Body Mass Index</Text>
        <Text style={styles.title} accessibilityRole="header">
          BMI calculator
        </Text>
        <Text style={styles.caption}>Works offline. Your entries are not saved.</Text>
      </View>

      <FitnessCard>
        <NumberField
          label="Weight"
          unit="kg"
          value={weightText}
          onChangeText={edit(setWeightText)}
          placeholder="e.g. 70"
          error={errors.weight}
        />
        {latestWeight ? (
          <Text style={styles.caption}>Pre-filled from your saved weight on {formatDateKey(latestWeight.date)}.</Text>
        ) : null}

        <Text style={styles.fieldLabel}>Height unit</Text>
        <ChipGroup
          options={HEIGHT_MODES}
          selectedId={heightMode}
          onSelect={edit(setHeightMode)}
          accessibilityLabel="Height unit"
        />
        {heightMode === 'cm' ? (
          <NumberField
            label="Height"
            unit="cm"
            value={cmText}
            onChangeText={edit(setCmText)}
            placeholder="e.g. 175"
            error={errors.height}
            onSubmitEditing={handleCalculate}
          />
        ) : (
          <View style={styles.row}>
            <NumberField label="Feet" unit="ft" value={feetText} onChangeText={edit(setFeetText)} placeholder="5" />
            <NumberField
              label="Inches"
              unit="in"
              value={inchesText}
              onChangeText={edit(setInchesText)}
              placeholder="9"
              onSubmitEditing={handleCalculate}
            />
          </View>
        )}
        {heightMode === 'ftin' && errors.height ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {errors.height}
          </Text>
        ) : null}

        <Text style={styles.fieldLabel}>Who is this for?</Text>
        <ChipGroup options={GROUPS} selectedId={group} onSelect={setGroup} accessibilityLabel="Who is this for" />

        <PrimaryButton title="Calculate BMI" icon="calculator-outline" onPress={handleCalculate} />
      </FitnessCard>

      {result ? (
        <>
          <SectionHeading title="Your result" />
          <FitnessCard variant={category ? 'highlight' : 'default'}>
            <View
              accessible
              accessibilityLiveRegion="polite"
              accessibilityLabel={`BMI ${roundBmi(result.bmi).toFixed(1)}${category ? `, ${category.name}` : ''}`}
            >
              <Text style={styles.label}>BMI</Text>
              <Text style={styles.bmiValue}>{roundBmi(result.bmi).toFixed(1)}</Text>
              {category ? (
                <Text style={[styles.categoryName, { color: TONE_COLORS[category.tone] }]}>{category.name}</Text>
              ) : null}
              <Text style={styles.caption}>Height used: {result.heightCm.toFixed(1)} cm</Text>
            </View>

            {group === 'adult' ? (
              <View style={styles.scale}>
                {BMI_CATEGORIES.map((item) => {
                  const active = item.id === category?.id;
                  return (
                    <View key={item.id} style={[styles.scaleRow, active && styles.scaleRowActive]}>
                      <View style={[styles.dot, { backgroundColor: TONE_COLORS[item.tone] }]} />
                      <Text style={[styles.scaleName, active && styles.scaleNameActive]}>{item.name}</Text>
                      <Text style={styles.scaleRange}>{item.range}</Text>
                    </View>
                  );
                })}
                <Text style={styles.caption}>Standard screening categories for adults.</Text>
              </View>
            ) : (
              <Notice tone="warning" title="Adult categories not shown" message={GROUP_NOTES[group]} />
            )}
          </FitnessCard>
        </>
      ) : null}

      <Notice title="BMI is a screening tool" message={SCREENING_NOTE} />
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
  fieldLabel: {
    ...typography.label,
    marginBottom: -spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
  bmiValue: {
    ...typography.display,
    fontSize: 44,
    lineHeight: 52,
    fontVariant: ['tabular-nums'],
  },
  categoryName: {
    ...typography.heading,
  },
  scale: {
    gap: spacing.xs,
  },
  scaleRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scaleRowActive: {
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  scaleName: {
    ...typography.body,
    flex: 1,
    color: colors.textSecondary,
  },
  scaleNameActive: {
    ...typography.bodyStrong,
  },
  scaleRange: {
    ...typography.caption,
    fontVariant: ['tabular-nums'],
  },
});
