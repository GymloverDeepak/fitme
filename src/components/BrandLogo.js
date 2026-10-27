import { Image, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

const LOGO = require('../../assets/images/gymlover-deepak-logo.png');

// Gym Lover Deepak logo. The artwork is black on transparency, so it sits on a white circular
// badge with an electric-blue ring to stay visible on FITME's midnight background. The image itself is only
// scaled (resizeMode "contain"), never cropped, stretched or recoloured.
export default function BrandLogo({ size = 72 }) {
  const ring = Math.max(2, Math.round(size * 0.03));
  return (
    <View
      style={[styles.badge, { width: size, height: size, borderRadius: size / 2, borderWidth: ring }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Gym Lover Deepak logo"
    >
      <Image source={LOGO} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.logoBadge,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '80%',
    height: '80%',
  },
});
