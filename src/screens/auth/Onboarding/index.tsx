import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Wrapper, Typography, Photo, Button } from 'components/common';
import { screenHeight, screenWidth, COLORS, FLEX_CENTER, setItem, formatTitle } from 'utils/index';
import { COMMON_TEXT } from 'constants/screens';
import { FontSize, FontWeight } from 'types/index';
import { VARIABLES } from 'constants/common';
import { useTranslation } from 'hooks/index';
import { getVariant, getVariantOnboardingPages, isSengoBrand } from 'constants/assets';
import { useAppDispatch } from 'types/reduxTypes';
import { setIsUserVisitedApp } from 'store/slices/appSettings';
import { APP_CONFIG } from 'config/app';

export const OnBoarding = () => {
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const { isLangRTL, t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const fullScreenWidth = screenWidth(100);
  const handleSkip = () => {
    dispatch(setIsUserVisitedApp(true));
    setItem(VARIABLES.IS_USER_VISITED_THE_APP, VARIABLES.IS_USER_VISITED_THE_APP);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollViewRef.current && isLangRTL) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    });

    return () => clearTimeout(timeout);
  }, [isLangRTL, scrollViewRef]);

  const variant = getVariant();
  const pages = getVariantOnboardingPages();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / fullScreenWidth);
    setCurrentPage(currentIndex);
  };
  const scrollToPage = (pageIndex: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: pageIndex * fullScreenWidth,
        animated: true,
      });
    }
  };
  useEffect(() => {
    if (pages.length <= 1) return undefined;

    const interval = setInterval(() => {
      if (currentPage < pages.length - 1) {
        scrollToPage(currentPage + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPage, pages.length]);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      scrollToPage(currentPage + 1);
    } else {
      handleSkip();
    }
  };

  const renderedPages = isLangRTL ? [...pages].reverse() : [...pages];
  const currentContent = renderedPages[currentPage];
  return (
    <Wrapper safeAreaEdges={['bottom']} darkMode={false} showBackButton={false}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {renderedPages.map((page, index) => (
          <View key={index} style={[styles.page, { width: fullScreenWidth }]}>
            <Photo source={page.image} imageStyle={styles.image} resizeMode='contain' />
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.bottomCard,
          {
            backgroundColor: isSengoBrand() ? COLORS.SECONDARY : COLORS.SURFACE,
            borderTopLeftRadius: isSengoBrand() ? 60 : 25,
            borderTopRightRadius: isSengoBrand() ? 60 : 25,
            gap: isSengoBrand() ? 25 : 15,
            paddingBottom: isSengoBrand() ? 60 : 20,
            paddingTop: isSengoBrand() ? 0 : 60,
          },
        ]}
      >
        {isSengoBrand() && (
          <View
            style={{
              height: 5,
              borderRadius: 10,
              backgroundColor: COLORS.WHITE,
              width: '50%',
              alignSelf: 'center',
              marginBottom: isSengoBrand() ? 40 : 0,
              top: 6,
            }}
          />
        )}
        <Typography
          style={[
            styles.heading,
            {
              color: isSengoBrand() ? COLORS.WHITE : COLORS.TEXT,
            },
          ]}
        >
          {formatTitle(t(currentContent?.heading ?? ''), 3)}
        </Typography>
        <Typography
          style={[
            styles.description,
            {
              color: isSengoBrand() ? COLORS.WHITE : COLORS.TEXT,
            },
          ]}
        >
          {t(currentContent?.description ?? '')}
        </Typography>

        {pages.length > 1 && (
          <View style={styles.pagination}>
            {renderedPages.map((_, index) => (
              <TouchableOpacity
                hitSlop={10}
                key={index}
                style={[styles.dot, index === currentPage ? styles.activeDot : null]}
                onPress={() => scrollToPage(index)}
              />
            ))}
          </View>
        )}

        <Button
          style={{
            backgroundColor: isSengoBrand() ? COLORS.BLACK : COLORS.BUTTON_BACKGROUND,
          }}
          title={
            currentPage === renderedPages.length - 1 ? COMMON_TEXT.GET_STARTED : COMMON_TEXT.NEXT
          }
          onPress={handleNext}
        />
        {variant !== 'sengo' && variant !== 'sengoWorkers' && (
          <TouchableOpacity onPress={handleSkip} hitSlop={12} style={styles.skipWrap}>
            <Typography style={styles.skipText}>{t(COMMON_TEXT.SKIP)}</Typography>
          </TouchableOpacity>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    ...FLEX_CENTER,
    height: screenHeight(65),
  },
  image: {
    width: screenWidth(100),
    height: screenHeight(100),
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 14,
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: COLORS.LAVENDER,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: COLORS.PRIMARY,
    width: 35,
    borderRadius: 8,
    height: 7,
  },
  scroll: { flex: 1 },
  bottomCard: {
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // bottom: 0,

    paddingHorizontal: 35,
    // elevation: 3,
    minHeight: screenHeight(40),
    // shadowColor: COLORS.BLACK,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  heading: {
    textAlign: 'center',
    fontSize: FontSize.ExtraLarge,
    // width: screenWidth(50),
    alignSelf: 'center',
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  description: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    marginHorizontal: 20,
  },
  skipWrap: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  skipText: {
    fontSize: FontSize.Large,
    color: COLORS.APP_TEXT_SMALL,
    // textDecorationLine: 'underline',
  },
});
