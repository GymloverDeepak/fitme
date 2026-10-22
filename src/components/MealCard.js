import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import FitnessCard from './FitnessCard';

// Summary of one meal. calories/protein are estimates; pass null to hide them.
export default function MealCard({ category, name, description, calories, protein, hasUnestimatedItems, onPress }) {
  const hasEstimate = typeof calories === 'number' && typeof protein === 'number';
  const estimateText = hasEstimate ? `≈ ${calories} kcal · ${protein} g protein${hasUnestimatedItems ? ' +' : ''}` : null;

  return (
    <FitnessCard
      onPress={onPress}
      accessibilityLabel={`${category}: ${name}${estimateText ? `. Estimated ${calories} kilocalories and ${protein} grams protein` : ''}`}
      accessibilityHint={onPress ? 'Opens meal details' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.category}>{category}</Text>
        {onPress ? <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} /> : null}
      </View>
      <Text style={styles.name}>{name}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {estimateText ? (
        <View style={styles.estimate}>
          <Ionicons name="flame-outline" size={16} color={colors.primary} />
          <Text style={styles.estimateText}>{estimateText}</Text>
        </View>
      ) : null}
    </FitnessCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    ...typography.label,
    color: colors.primary,
  },
  name: {
    ...typography.subheading,
    marginTop: -spacing.xs,
  },
  description: {
    ...typography.caption,
  },
  estimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  estimateText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});
