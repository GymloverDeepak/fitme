// MIDNIGHT TITANIUM — central colour palette for FITME. Import from '../theme' instead of
// hard-coding colours. Names are semantic: pick by meaning (surface, accent, error), not by hue.
const colors = {
  // Canvas
  background: '#080D18',
  backgroundSecondary: '#0F1726',

  // Titanium surfaces (cards, inputs, sheets)
  surface: '#182235',
  surfaceElevated: '#202D42',
  surfacePressed: '#26354D',

  // Electric blue: selected controls and the main action on a screen
  accent: '#42B8FF',
  accentPressed: '#2586D8',
  accentSoft: 'rgba(66, 184, 255, 0.14)',
  accentMuted: 'rgba(66, 184, 255, 0.45)',
  onAccent: '#061220',

  textPrimary: '#F4F7FC',
  textSecondary: '#AAB7CA',

  border: '#293A50',
  borderStrong: '#3B5170',

  // Status
  success: '#35D39A',
  successSoft: 'rgba(53, 211, 154, 0.14)',
  onSuccess: '#04150F',
  warning: '#FFB547',
  warningSoft: 'rgba(255, 181, 71, 0.12)',
  error: '#FF626C',
  errorSoft: 'rgba(255, 98, 108, 0.12)',

  disabled: '#253246',

  // Illustration colours for the exercise demonstrations
  metal: '#C3CCD9',
  metalDark: '#5B6B82',
  ghost: 'rgba(244, 247, 252, 0.22)',

  // The Gym Lover Deepak artwork is black on transparency and needs a light badge to stay visible.
  logoBadge: '#FFFFFF',
};

export default colors;
