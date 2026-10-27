// Spacing scale, corner radii, borders and layout constants shared by every screen.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Precise, restrained corners: cards stay crisp rather than bubbly.
export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const borders = {
  thin: 1,
  thick: 1.5,
  // Left-edge marker on highlighted cards and the active set.
  marker: 3,
};

export const layout = {
  screenPadding: 16,
  // Keeps content readable on tablets and wide phones.
  maxContentWidth: 640,
  // Android accessibility guideline: touch targets at least 48dp.
  minTouchTarget: 48,
};
