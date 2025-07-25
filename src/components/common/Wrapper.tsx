import { KeyboardAvoidingView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { COLORS, isIOS, screenHeight } from 'utils/index';
import { Loader } from './index';
import { RootState, useAppSelector } from 'types/reduxTypes';

interface WrapperProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  useScrollView?: boolean;
  backgroundColor?: string;
  darkMode?: boolean;
  loader?: boolean;
  showAppLoader?: boolean;
  loaderOpacity?: number;
  loaderBackgroundColor?: string;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  useSafeArea = true,
  useScrollView = false,
  backgroundColor = COLORS.WHITE,
  darkMode = true,
  loader,
  showAppLoader = false,
}) => {
  const isAppLoading = useAppSelector((state: RootState) => state.app.isAppLoading);

  return (
    <>
      {useSafeArea && <View style={[styles.safeArea, { backgroundColor }]} />}
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={darkMode ? 'dark-content' : 'light-content'}
      />
      {loader && <Loader />}
      {showAppLoader && isAppLoading && <Loader />}
      <KeyboardAvoidingView
        behavior={isIOS() ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: COLORS.WHITE }]}
      >
        {useScrollView ? (
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={[styles.container, { backgroundColor: COLORS.WHITE }]}
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
};

const styles = StyleSheet.create({
  safeArea: {
    height: isIOS() ? screenHeight(5) : 0,
  },
  container: {
    flex: 1,
  },
});
