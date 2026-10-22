import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '../theme';

// Tab screens: the tab bar already covers the bottom inset.
export const TAB_EDGES = ['top', 'left', 'right'];
// Stack screens: the header covers the top inset.
export const STACK_EDGES = ['left', 'right', 'bottom'];

// Wraps every screen: dark background, safe-area padding, scrolling and a max content width
// so layouts stay readable on wide screens such as an unfolded foldable or a tablet.
export default function ScreenContainer({
  children,
  edges = TAB_EDGES,
  scrollable = true,
  keyboardAware = false,
  contentStyle,
}) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  const body = scrollable ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    <View style={[styles.fill, styles.scrollContent]}>{content}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {keyboardAware ? (
        <KeyboardAvoidingView style={styles.fill} behavior="padding">
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.screenPadding,
    gap: spacing.xl,
  },
});
