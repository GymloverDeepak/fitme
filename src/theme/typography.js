import colors from './colors';

// Text styles used across the app. Spread them into a StyleSheet: { ...typography.body }.
const typography = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.textPrimary,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subheading: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
};

export default typography;
