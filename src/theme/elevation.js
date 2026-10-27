// Elevation levels. On a near-black canvas depth comes mostly from lighter surfaces, so shadows
// stay subtle and are reserved for floating elements (tab bar, raised cards).
const elevation = {
  none: {
    elevation: 0,
    shadowOpacity: 0,
  },
  raised: {
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  floating: {
    elevation: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
  },
};

export default elevation;
