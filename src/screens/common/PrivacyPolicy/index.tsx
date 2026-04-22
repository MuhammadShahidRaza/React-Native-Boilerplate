import { StyleSheet, View, Animated } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { Wrapper, SkeletonWrapper, Typography } from 'components/common';
import { COMMON_TEXT, ENV_CONSTANTS, SCREENS, TEMPORARY_TEXT } from 'constants/index';
import { AppScreenProps } from 'types/index';
import { getStaticPage } from 'api/functions/app/settings';
import { useTranslation } from 'hooks/useTranslation';
import { WebView } from 'react-native-webview';
import { screenHeight, screenWidth } from 'utils/helpers';
import { COLORS } from 'utils/colors';
import { generateWebViewHTML } from 'utils/webViewHelpers';
import { logger } from 'utils/logger';
import { useFadeTransition } from 'hooks/useFadeTransition';

export type StaticPageType =
  | typeof COMMON_TEXT.PRIVACY_POLICY
  | typeof COMMON_TEXT.TERMS_AND_CONDITIONS
  | typeof COMMON_TEXT.ABOUT_US
  | 'Cancellation Policy';

export type StaticPage = {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export const PrivacyPolicy = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.PRIVACY_POLICY>) => {
  const { t } = useTranslation();
  const [pageData, setPageData] = useState<StaticPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const pageType = route?.params?.title || (COMMON_TEXT.PRIVACY_POLICY as StaticPageType);

  // Use custom hook for fade transition
  const { fromOpacity, toOpacity, reset, transition } = useFadeTransition();

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      setShowSkeleton(true);
      reset();

      try {
        const page = await getStaticPage(pageType);
        if (page) {
          setPageData(page);
        }
      } catch (error) {
        logger.error('Error loading page:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageType, navigation, t, reset]);

  // Generate HTML content using utility function
  const htmlContent = useMemo(() => {
    const content = ENV_CONSTANTS.IS_ALPHA_PHASE
      ? t(TEMPORARY_TEXT.LORUM_IPSUM_TOO_LONG)
      : pageData?.description || '';
    return generateWebViewHTML(content);
  }, [pageData?.description, t]);

  const isAboutUs = pageType === COMMON_TEXT.ABOUT_US;

  return (
    <Wrapper useScrollView={false} headerTitle={pageType}>
      <View style={styles.container}>
        {/* Skeleton with fade animation */}
        {showSkeleton && (
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.skeletonContainer, { opacity: fromOpacity }]}
            pointerEvents={isLoading ? 'auto' : 'none'}
          >
            <SkeletonWrapper
              isLoading={true}
              height={screenHeight(12)}
              width={screenWidth(90)}
              borderRadius={12}
              count={6}
              style={styles.skeletonItem}
            >
              <View style={{ flex: 1 }} />
            </SkeletonWrapper>
          </Animated.View>
        )}

        {/* WebView */}
        {pageData && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: toOpacity }]}>
            <WebView
              source={{ html: htmlContent }}
              style={styles.webView}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
              scalesPageToFit={true}
              onLoadEnd={() => transition(250, 50, () => setShowSkeleton(false))}
            />
          </Animated.View>
        )}

        {/* Version & Build at bottom - About Us only */}
        {isAboutUs && (
          <View style={styles.versionFooter}>
            <Typography translate={false} style={styles.versionText}>
             {`Version ${getVersion()} (${getBuildNumber()})`}
            </Typography>
          </View>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  skeletonContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  skeletonItem: {
    marginVertical: 10,
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  versionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    zIndex: 10,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
});
