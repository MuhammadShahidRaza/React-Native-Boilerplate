import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Wrapper, SvgComponent, Typography, Icon, RowComponent } from 'components/common';
import { screenHeight, screenWidth, COLORS, FLEX_CENTER, setItem } from 'utils/index';
import { COMMON_TEXT, ONBOARDING_TEXT } from 'constants/screens';
import { FontSize, FontWeight } from 'types/index';
import { VARIABLES } from 'constants/common';
import { useTranslation } from 'hooks/index';
import { SVG } from 'constants/assets';
import { useAppDispatch } from 'types/reduxTypes';
import { setIsUserVisitedApp } from 'store/slices/appSettings';

export const OnBoarding = () => {
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const { isLangRTL } = useTranslation();
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

  const pages = [
    {
      svg: SVG.LOGO,
      heading: ONBOARDING_TEXT.HEADING_1,
      description: ONBOARDING_TEXT.DESCRIPTION_1,
    },
    {
      svg: SVG.LOGO,
      heading: ONBOARDING_TEXT.HEADING_2,
      description: ONBOARDING_TEXT.DESCRIPTION_2,
    },
    {
      svg: SVG.LOGO,
      heading: ONBOARDING_TEXT.HEADING_3,
      description: ONBOARDING_TEXT.DESCRIPTION_3,
    },
  ];

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
    const interval = setInterval(() => {
      if (currentPage < 2) {
        scrollToPage(currentPage + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPage]);

  const renderedPages = isLangRTL ? [...pages].reverse() : [...pages];
  return (
    <Wrapper>
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
            <SvgComponent
              svgWidth={screenWidth(75)}
              svgHeight={screenHeight(40)}
              // containerStyle={index == 1 ? styles.svgContainer : {}}
              Svg={page.svg}
            />
            <Typography
              color={COLORS.SECONDARY}
              fontSize={FontSize.XL}
              style={styles.heading}
              fontWeight={FontWeight.Bold}
            >
              {page.heading}
            </Typography>
            <Typography style={styles.description}>{page.description}</Typography>
          </View>
        ))}
      </ScrollView>
      <View style={styles.secondContainer}>
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <TouchableOpacity
              hitSlop={10}
              key={index}
              style={[styles.dot, index === currentPage ? styles.activeDot : null]}
              onPress={() => scrollToPage(index)}
            />
          ))}
        </View>
        {currentPage == 2 && (
          <RowComponent
            isRightLeftJustify
            activeOpacity={0.5}
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Typography style={styles.skipButtonText}>{COMMON_TEXT.SKIP}</Typography>
            <Icon
              size={FontSize.ExtraLarge}
              componentName={VARIABLES.AntDesign}
              color={COLORS.SECONDARY}
              iconName={isLangRTL ? 'arrowleft' : 'arrowright'}
            />
          </RowComponent>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 25,
    ...FLEX_CENTER,
  },
  svgContainer: {
    width: screenWidth(100),
    alignItems: 'flex-end',
  },
  heading: {
    marginBottom: 20,
    marginTop: 60,
  },
  description: {
    fontSize: FontSize.Medium,
    textAlign: 'center',
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: COLORS.PRIMARY,
    width: 10,
    borderRadius: 10,
    height: 18,
  },
  skipButton: {
    zIndex: 1,
    right: 50,
    alignSelf: 'flex-end',
    padding: 15,
    gap: 5,
    bottom: 40,
  },
  skipButtonText: {
    color: COLORS.SECONDARY,
    marginBottom: 5,
    fontSize: FontSize.Large,
  },
  scroll: { maxHeight: screenHeight(82) },
  secondContainer: {
    height: screenHeight(18),
    justifyContent: 'space-between',
  },
  logo: {
    position: 'absolute',
    bottom: -80,
    right: -80,
  },
});
