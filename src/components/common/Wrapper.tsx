import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { COLORS } from 'utils/index';
import { Loader } from './index';
import { RootState, useAppSelector } from 'types/reduxTypes';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';
import { isIOS } from 'utils/index';
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
  children: React.ReactNode;
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
}) => {
  const isAppLoading = useAppSelector((state: RootState) => state.app.isAppLoading);
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { isDark } = useTheme();
  // Only show header if title or back button is provided
  const shouldShowHeader = headerTitle || showBackButton;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true); // or some other action
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false); // or some other action
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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

  // Determine KeyboardAvoidingView behavior
  const keyboardBehavior = useMemo(() => {
    if (isIOS()) {
      return 'padding';
    }
    // For Android, use 'height' when keyboard is visible, otherwise undefined
    return isKeyboardVisible ? 'height' : undefined;
  }, [isKeyboardVisible]);

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
        <View style={styles.headerWrapper}>
          <Header
            title={headerTitle || ''}
            showBackButton={showBackButton || false}
            onPressBack={onPressBack}
          />
        </View>
      )}
      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        style={[
          styles.container,
          {
            backgroundColor: COLORS.BACKGROUND,
            paddingBottom: bottomPadding,
          },
        ]}
        // keyboardVerticalOffset={isIOS() ? 0 : 80}
      >
        {useScrollView ? (
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            showsHorizontalScrollIndicator={false}
            style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}
            bounces={false}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </>
  );

  // Render based on safe area configuration
  if (!useSafeArea) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  // Handle different safe area edge combinations
  if (hasTopSafeArea && hasBottomSafeArea) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView edges={['top']} style={[styles.topSafeArea, { backgroundColor }]} />
        <View style={styles.contentWrapper}>{content}</View>
        <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />
      </View>
    );
  }

  if (hasTopSafeArea) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView edges={['top']} style={[styles.topSafeArea, { backgroundColor }]} />
        <View style={styles.contentWrapper}>{content}</View>
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
    backgroundColor: COLORS.BACKGROUND,
  },
  bottomSafeArea: {
    backgroundColor: COLORS.SURFACE,
  },
  headerWrapper: {
    backgroundColor: COLORS.BACKGROUND,
    zIndex: 1000,
  },
});
