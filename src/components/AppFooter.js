import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { DEVELOPER, SOCIAL_LINKS } from '../data/appInfo';
import { colors, layout, radius, spacing, typography } from '../theme';
import BrandLogo from './BrandLogo';

// Opens a link and lets Android choose the app or browser. If nothing can handle it (or there is
// no connection for a web link), show a friendly message instead of failing silently.
async function openLink(url, failureTitle, failureMessage) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(failureTitle, failureMessage);
  }
}

function ContactRow({ icon, value, url, accessibilityLabel, fallbackTitle }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      onPress={() =>
        openLink(url, fallbackTitle, `No app was found to open this. You can reach the developer at:\n\n${value}`)
      }
      style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={colors.accent} />
      <Text style={styles.contactText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
        {value}
      </Text>
    </Pressable>
  );
}

function SocialButton({ link }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={link.label}
      onPress={() =>
        openLink(
          link.url,
          'Could not open link',
          'Please check your internet connection and try again. You can also open this link in your browser:\n\n' +
            link.url,
        )
      }
      style={({ pressed }) => [styles.socialButton, pressed && styles.socialPressed]}
    >
      <Ionicons name={link.icon} size={24} color={colors.accent} />
    </Pressable>
  );
}

// Developer credit and social links shown at the bottom of Home and About. It sits inside the
// screen's scroll content, so it never covers the bottom tab bar.
// showLogo adds the Gym Lover Deepak logo above the credit (used on About; Home has it in the header).
export default function AppFooter({ showLogo = false }) {
  return (
    <View style={styles.footer}>
      {showLogo ? (
        <View style={styles.logo}>
          <BrandLogo size={120} />
        </View>
      ) : null}
      <Text style={styles.credit}>{DEVELOPER.creditLine}</Text>
      <Text style={styles.name}>{DEVELOPER.name}</Text>
      <View style={styles.contacts}>
        <ContactRow
          icon="mail-outline"
          value={DEVELOPER.email}
          url={`mailto:${DEVELOPER.email}`}
          accessibilityLabel={`Email ${DEVELOPER.name} at ${DEVELOPER.email}`}
          fallbackTitle="Email"
        />
        <ContactRow
          icon="call-outline"
          value={DEVELOPER.phone}
          url={`tel:${DEVELOPER.phone}`}
          accessibilityLabel={`Call ${DEVELOPER.name} on ${DEVELOPER.phone.split('').join(' ')}`}
          fallbackTitle="Phone"
        />
      </View>
      <View style={styles.socialRow}>
        {SOCIAL_LINKS.map((link) => (
          <SocialButton key={link.id} link={link} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logo: {
    marginBottom: spacing.md,
  },
  credit: {
    ...typography.caption,
    fontSize: 12,
  },
  name: {
    ...typography.heading,
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: spacing.sm,
    marginTop: spacing.xs,
  },
  contactRow: {
    minHeight: layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  pressed: {
    backgroundColor: colors.accentSoft,
  },
  contactText: {
    ...typography.body,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  socialButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialPressed: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
});
