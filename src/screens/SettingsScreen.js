import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import ChipGroup from '../components/ChipGroup';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import ScreenContainer from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import { APP_VERSION } from '../data/appInfo';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { GLASS_SIZE_ML, WATER_GOAL_LIMITS } from '../storage/sanitize';
import { colors, spacing, typography } from '../theme';
import { LENGTH_UNITS, WEIGHT_UNITS } from '../utils/units';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, clearAllData } = useAppState();
  const [isClearing, setIsClearing] = useState(false);
  const goal = settings.waterGoalGlasses;

  const changeWaterGoal = (delta) => {
    const next = Math.min(WATER_GOAL_LIMITS.max, Math.max(WATER_GOAL_LIMITS.min, goal + delta));
    if (next !== goal) updateSettings({ waterGoalGlasses: next });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear all FITME data?',
      'This permanently deletes your workout history, active session, water log, body weight, measurements and preferences from this phone. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            const cleared = await clearAllData();
            setIsClearing(false);
            Alert.alert(
              cleared ? 'Data cleared' : 'Could not clear data',
              cleared
                ? 'All FITME data has been removed from this phone.'
                : 'Something went wrong while deleting data. Please try again.',
            );
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <Text style={styles.title} accessibilityRole="header">
        Settings
      </Text>

      <SectionHeading title="Units" />
      <FitnessCard>
        <Text style={styles.label}>Body weight</Text>
        <ChipGroup
          options={WEIGHT_UNITS}
          selectedId={settings.weightUnit}
          onSelect={(weightUnit) => updateSettings({ weightUnit })}
          accessibilityLabel="Body weight unit"
        />
        <Text style={styles.label}>Body measurements</Text>
        <ChipGroup
          options={LENGTH_UNITS}
          selectedId={settings.lengthUnit}
          onSelect={(lengthUnit) => updateSettings({ lengthUnit })}
          accessibilityLabel="Measurement unit"
        />
        <Text style={styles.caption}>Existing entries are converted automatically for display.</Text>
      </FitnessCard>

      <SectionHeading title="Daily water goal" />
      <FitnessCard>
        <View style={styles.stepper}>
          <SecondaryButton
            title=""
            icon="remove"
            onPress={() => changeWaterGoal(-1)}
            disabled={goal <= WATER_GOAL_LIMITS.min}
            accessibilityLabel="Decrease water goal"
            style={styles.stepperButton}
          />
          <View style={styles.stepperValue} accessible accessibilityLabel={`Water goal ${goal} glasses`}>
            <Text style={styles.goalNumber}>{goal}</Text>
            <Text style={styles.caption}>glasses · {goal * GLASS_SIZE_ML} ml</Text>
          </View>
          <SecondaryButton
            title=""
            icon="add"
            onPress={() => changeWaterGoal(1)}
            disabled={goal >= WATER_GOAL_LIMITS.max}
            accessibilityLabel="Increase water goal"
            style={styles.stepperButton}
          />
        </View>
      </FitnessCard>

      <SectionHeading title="Theme" />
      <FitnessCard>
        <View style={styles.themeRow}>
          <Ionicons name="moon-outline" size={22} color={colors.accent} />
          <View style={styles.flex}>
            <Text style={styles.bodyStrong}>Midnight Titanium — navy, titanium & electric blue</Text>
            <Text style={styles.caption}>
              FITME uses one high-contrast dark theme on every screen. It does not change with the phone’s light/dark
              setting.
            </Text>
          </View>
        </View>
        <View style={styles.swatches}>
          {[colors.background, colors.surface, colors.surfaceElevated, colors.accent, colors.success, colors.textPrimary].map((color) => (
            <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
          ))}
        </View>
      </FitnessCard>

      <SectionHeading title="Your data" />
      <FitnessCard>
        <Text style={styles.body}>
          FITME stores your data only on this phone using local storage. There is no account, no server and no cloud
          backup, so uninstalling the app or clearing its storage removes your data.
        </Text>
        <SecondaryButton
          title={isClearing ? 'Clearing…' : 'Clear all data'}
          icon="trash-outline"
          tone="danger"
          onPress={handleClearData}
          disabled={isClearing}
        />
      </FitnessCard>

      <SectionHeading title="About" />
      <FitnessCard
        onPress={() => navigateSafely(navigation, ROUTES.ABOUT)}
        accessibilityLabel="About FITME"
        accessibilityHint="Opens app version and offline information"
      >
        <View style={styles.themeRow}>
          <Ionicons name="information-circle-outline" size={22} color={colors.accent} />
          <View style={styles.flex}>
            <Text style={styles.bodyStrong}>About FITME</Text>
            <Text style={styles.caption}>Version {APP_VERSION}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </FitnessCard>

      {__DEV__ ? (
        <>
          <SectionHeading title="Developer" subtitle="Visible only in development builds" />
          <SecondaryButton
            title="Open design preview"
            icon="color-palette-outline"
            onPress={() => navigateSafely(navigation, ROUTES.DESIGN_PREVIEW)}
          />
        </>
      ) : null}

      <Notice message="Changes on this screen are saved automatically." />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
  },
  label: {
    ...typography.label,
    color: colors.accent,
  },
  caption: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
  },
  bodyStrong: {
    ...typography.bodyStrong,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperButton: {
    width: 64,
    paddingHorizontal: 0,
  },
  stepperValue: {
    flex: 1,
    alignItems: 'center',
  },
  goalNumber: {
    ...typography.display,
    color: colors.accent,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  swatches: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
