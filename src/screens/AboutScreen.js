import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import AppFooter from '../components/AppFooter';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SectionHeading from '../components/SectionHeading';
import { ANDROID_VERSION_CODE, APP_VERSION } from '../data/appInfo';
import { DIET_DISCLAIMER } from '../data/dietPlans';
import { WORKOUT_DISCLAIMER } from '../data/workouts';
import { colors, spacing, typography } from '../theme';

const FEATURES = [
  { icon: 'cloud-offline-outline', title: 'Works offline', text: 'Workouts, diet plans and progress tracking work without internet.' },
  { icon: 'shield-checkmark-outline', title: 'No account needed', text: 'No login, no ads, no subscription and no paid features.' },
  { icon: 'phone-portrait-outline', title: 'Data stays on this phone', text: 'Your progress is saved locally. It is not synced or backed up to any server.' },
];

export default function AboutScreen() {
  return (
    <ScreenContainer edges={STACK_EDGES}>
      <View style={styles.hero}>
        <Text style={styles.logo} accessibilityRole="header" accessibilityLabel="FITME">
          FIT<Text style={styles.logoAccent}>ME</Text>
        </Text>
        <Text style={styles.tagline}>Your offline bodybuilding companion</Text>
        <Text style={styles.version}>
          Version {APP_VERSION} (build {ANDROID_VERSION_CODE})
        </Text>
      </View>

      <View style={styles.list}>
        {FEATURES.map((feature) => (
          <FitnessCard key={feature.title}>
            <View style={styles.featureRow}>
              <Ionicons name={feature.icon} size={24} color={colors.primary} />
              <View style={styles.flex}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.caption}>{feature.text}</Text>
              </View>
            </View>
          </FitnessCard>
        ))}
      </View>

      <SectionHeading title="Health notice" />
      <Notice tone="warning" message={WORKOUT_DISCLAIMER} />
      <Notice tone="warning" message={DIET_DISCLAIMER} />

      <AppFooter showLogo />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  logo: {
    ...typography.display,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: 4,
  },
  logoAccent: {
    color: colors.primary,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  version: {
    ...typography.label,
  },
  list: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    ...typography.subheading,
  },
  caption: {
    ...typography.caption,
  },
});
