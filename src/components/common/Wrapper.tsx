import { StatusBar, StyleSheet, StyleProp, TextStyle, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { COLORS } from 'utils/index';
import { Loader } from './index';
import { RootState, useAppSelector } from 'types/reduxTypes';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactNode, useMemo } from 'react';
import { Header } from './Header';
import { onBack } from 'navigation/index';
import { useTheme } from 'hooks/useTheme';

/**
 * Wrapper Component - Handles safe area, keyboard, and common screen layout
 *
 * USAGE PATTERNS:
 *
 * 1. Default (most screens): <Wrapper> - Uses top safe area only
 * 2. Screen with bottom tabs: <Wrapper safeAreaEdges={['top', 'bottom']}> - Prevents bottom color showing
 * 3. Screen with navigation header: <Wrapper safeAreaEdges={['bottom']}> - Header handles top
 * 4. Full screen modal: <Wrapper useSafeArea={false}> - No safe area
 * 5. Custom background: <Wrapper backgroundColor={COLORS.PRIMARY}> - Override background
 *
 * NOTE: If you see bottom background color showing, add safeAreaEdges={['top', 'bottom']}
 */

interface WrapperProps {
  children: ReactNode;
  useSafeArea?: boolean;
  useScrollView?: boolean;
  backgroundColor?: string;
  darkMode?: boolean;
  loader?: boolean;
  showAppLoader?: boolean;
  wantPaddingBottom?: boolean;
  safeAreaEdges?: Edge[];
  headerTitle?: string;
  showBackButton?: boolean;
  onPressBack?: () => void;
  /** Passed to `Header` → `CustomBackIcon` (e.g. consumer flows). */
  backIconStyle?: StyleProp<TextStyle>;
  /** Right side of header row (e.g. cancel action). */
  headerEndIcon?: ReactNode | (() => ReactNode);
  /** Color of the bottom safe-area inset strip. Defaults to `backgroundColor` — override when the screen's last visible content (e.g. a bottom card) uses a different color. */
  bottomSafeAreaColor?: string;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  useSafeArea = true,
  useScrollView = false,
  backgroundColor = COLORS.BACKGROUND,
  darkMode = true,
  loader,
  showAppLoader = false,
  wantPaddingBottom = true,
  safeAreaEdges = ['top'],
  headerTitle,
  showBackButton = true,
  onPressBack = () => onBack(),
  backIconStyle,
  headerEndIcon,
  bottomSafeAreaColor = backgroundColor,
}) => {
  const isAppLoading = useAppSelector((state: RootState) => state.app.isAppLoading);
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  // Only show header if title or back button is provided
  const shouldShowHeader = headerTitle || showBackButton;

  // Memoize safe area edge checks
  const hasTopSafeArea = useMemo(() => safeAreaEdges.includes('top'), [safeAreaEdges]);
  const hasBottomSafeArea = useMemo(() => safeAreaEdges.includes('bottom'), [safeAreaEdges]);

  // Calculate bottom padding: safe area only (keyboard handled by KeyboardAvoidingView)
  const bottomPadding = useMemo(() => {
    if (!wantPaddingBottom || hasBottomSafeArea) {
      return 0;
    }
    return insets.bottom;
  }, [wantPaddingBottom, hasBottomSafeArea, insets.bottom]);

  const content = (
    <>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={darkMode || isDark ? 'light-content' : 'dark-content'}
      />
      {loader && <Loader />}
      {showAppLoader && isAppLoading && <Loader />}
      {/* Fixed Header - doesn't scroll */}
      {shouldShowHeader && (
        <View style={[styles.headerWrapper, { backgroundColor }]}>
          <Header
            title={headerTitle || ''}
            showBackButton={showBackButton || false}
            onPressBack={onPressBack}
            backIconStyle={backIconStyle}
            endIcon={headerEndIcon}
          />
        </View>
      )}
      {useScrollView ? (
        <KeyboardAwareScrollView
          bottomOffset={20}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          showsHorizontalScrollIndicator={false}
          style={[styles.container, { backgroundColor, paddingBottom: bottomPadding }]}
          bounces={false}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <KeyboardAvoidingView
          behavior='padding'
          style={[
            styles.container,
            {
              backgroundColor,
              paddingBottom: bottomPadding,
            },
          ]}
        >
          {children}
        </KeyboardAvoidingView>
      )}
    </>
  );

  // Render based on safe area configuration
  if (!useSafeArea) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  const bgStyle = { backgroundColor };

  // Handle different safe area edge combinations
  if (hasTopSafeArea && hasBottomSafeArea) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView edges={['top']} style={[styles.topSafeArea, { backgroundColor }]} />
        <View style={[styles.contentWrapper, bgStyle]}>{content}</View>
        <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />
      </View>
    );
  }

  if (hasTopSafeArea) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView edges={['top']} style={[styles.topSafeArea, { backgroundColor }]} />
        <View style={[styles.contentWrapper, bgStyle]}>{content}</View>
      </View>
    );
  }

  if (hasBottomSafeArea) {
    return (
      <View style={styles.wrapper}>
        {content}
        <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />
      </View>
    );
  }

  // No safe area edges
  return <View style={styles.wrapper}>{content}</View>;
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topSafeArea: {
    flex: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: COLORS.SURFACE,
  },
  headerWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
});
