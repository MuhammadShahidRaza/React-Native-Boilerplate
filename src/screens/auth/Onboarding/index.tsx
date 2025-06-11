import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
import { Wrapper, SvgComponent, Typography, Icon, RowComponent, Button } from 'components/common';
import { screenHeight, screenWidth, COLORS, FLEX_CENTER, setItem } from 'utils/index';
import { COMMON_TEXT, ONBOARDING_TEXT } from 'constants/screens';
import { FontSize, FontWeight } from 'types/index';
import { VARIABLES } from 'constants/common';
import { useTranslation } from 'hooks/index';
import { IMAGES, SVG } from 'constants/assets';
import { useAppDispatch } from 'types/reduxTypes';
import { setIsUserVisitedApp } from 'store/slices/appSettings';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';

export const OnBoarding = () => {
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const { isLangRTL } = useTranslation();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const fullScreenWidth = screenWidth(100);
  const handleSkip = () => {
    navigate(SCREENS.ROLESELECTION)
    // dispatch(setIsUserVisitedApp(true));
    // setItem(VARIABLES.IS_USER_VISITED_THE_APP, VARIABLES.IS_USER_VISITED_THE_APP);
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
      image: IMAGES.ONBOARDING1,
      heading: ONBOARDING_TEXT.HEADING_1,
      description: ONBOARDING_TEXT.DESCRIPTION_1,
    },
    {
      image: IMAGES.ONBOARDING2,
      heading: ONBOARDING_TEXT.HEADING_2,
      description: ONBOARDING_TEXT.DESCRIPTION_2,
    },
    {
      image: IMAGES.ONBOARDING3,
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
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (currentPage < 2) {
  //       scrollToPage(currentPage + 1);
  //     }
  //   }, 2000);

  //   return () => clearInterval(interval);
  // }, [currentPage]);

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
            
            <Image
  source={page.image} // If it's a PNG/JPG instead of SVG
  style={{ width: fullScreenWidth, height: screenHeight(55), resizeMode: 'cover' }}
/>
            <Typography
              color={COLORS.BLACK}
              fontSize={FontSize.ExtraLarge+4}
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
  {/* Pagination dots */}
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

  {/* Buttons */}
  {currentPage < 2 ? (
    <View
      style={{marginBottom: 40,alignSelf:'center',justifyContent:'center',alignItems:'center' }}
    >
     

     <TouchableOpacity
  style={{ marginBottom: 10 }}
>
        <Button title={COMMON_TEXT.NEXT} onPress={()=>{scrollToPage(currentPage+1);}} textStyle={{fontWeight:'700'}}    />
      </TouchableOpacity>
       <TouchableOpacity onPress={handleSkip}>
        <Typography color={COLORS.SECONDARY} fontSize={FontSize.MediumLarge} fontWeight='700' >
          {COMMON_TEXT.SKIP}
        </Typography>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={{ alignSelf: 'center', marginBottom: 75 }}>
      <Button title={COMMON_TEXT.CONTINUE} textStyle={{fontWeight:'700'}}  onPress={handleSkip} />
    </View>
  )}
</View>

      {/* <View style={styles.secondContainer}>
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <TouchableOpacity
              hitSlop={10}
              key={index}
              style={[styles.dot, index === currentPage ? styles.activeDot : null]}
              onPress={() => scrollToPage(index)}
            />
          ))}
          <View style={{alignSelf:'center',marginBottom:40}}><Button title={COMMON_TEXT.CONTINUE} /></View>
        </View>
        {currentPage == 2 && (
          <View style={{alignSelf:'center',marginBottom:40}}><Button title={COMMON_TEXT.CONTINUE} /></View>
        )}
      </View> */}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 25,
    ...FLEX_CENTER,
  },
  // svgContainer: {
  //   width: screenWidth(100),
  //   alignItems: 'flex-end',
  // },
  svgContainer: {
  width: screenWidth(100),
  height: screenHeight(50),
  justifyContent: 'center',
  alignItems: 'center',
},

  heading: {
    marginBottom: 20,
    textAlign:'center'
  },
  description: {
    fontSize: FontSize.MediumSmall,
    textAlign: 'center',
    color:COLORS.ICONS,
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 23,
    height: 7,
    backgroundColor: COLORS.GRAY,
    marginHorizontal: 5,
    borderRadius:10
  },
  activeDot: {
    backgroundColor: COLORS.PURPLE,
    width: 46,
    height: 7,
    borderRadius:10
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
