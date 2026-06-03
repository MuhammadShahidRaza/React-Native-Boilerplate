import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import {
  Typography,
  Photo,
  RowComponent,
  SvgComponent,
  AppGradient,
  GradientIcon,
  Button,
  Wrapper,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { IMAGES, SVG } from 'constants/assets';
import { COLORS, screenWidth, STYLES } from 'utils/index';
import {
  getHomeData,
  homePromosForDisplay,
  type SnliftHomeBanner,
  type HomePromoDisplay,
} from 'api/functions/snlift/home';
import type { RootState } from 'types/reduxTypes';

export const Home = () => {
  const user = useSelector((state: RootState) => state.user.userDetails);
  const [banners, setBanners] = useState<SnliftHomeBanner[]>([]);
  const [promoCodes, setPromoCodes] = useState<HomePromoDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHome = useCallback(async () => {
    setLoading(true);
    const data = await getHomeData();
    if (data) {
      setBanners(data.banners);
      setPromoCodes(homePromosForDisplay(data.promo_codes));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const primaryBanner = banners[0];
  const displayName = user?.full_name?.split(' ')?.[0] || user?.first_name || 'there';

  return (
    <Wrapper
      showBackButton={false}
      safeAreaEdges={[]}
      wantPaddingBottom={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <AppGradient style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            <RowComponent style={styles.locPillWrap}>
              <GradientIcon
                componentName={VARIABLES.EvilIcons}
                iconName='location'
                size={FontSize.ExtraLarge}
                color={COLORS.WHITE}
              />
              <View style={{ marginLeft: 10 }}>
                <Typography style={styles.locLabel}>Location</Typography>
                <Typography style={styles.locText} numberOfLines={1}>
                  New York, United States
                </Typography>
              </View>
            </RowComponent>
            <GradientIcon
              componentName={VARIABLES.Feather}
              iconName='bell'
              onPress={() => navigate(SCREENS.NOTIFICATIONS)}
              size={FontSize.Medium}
              color={COLORS.WHITE}
            />
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Typography style={styles.greet} translate={false}>
              {('Hello, ' + displayName + '!') as string}
            </Typography>
            <Typography style={styles.sub}>Where would you like to go today?</Typography>

            {loading && !primaryBanner ? (
              <ActivityIndicator color={COLORS.WHITE} style={styles.bannerLoader} />
            ) : (
              <Pressable style={styles.banner} onPress={() => navigate(SCREENS.BOOK_RIDE)}>
                <Photo
                  source={
                    primaryBanner?.image ? { uri: primaryBanner.image } : IMAGES.HOME
                  }
                  imageStyle={styles.bannerImg}
                />
                <View style={styles.bannerText}>
                  <Typography style={styles.bannerTitle}>
                    {primaryBanner?.title ?? 'Book a Ride'}
                  </Typography>
                  <Typography style={styles.bannerSub}>
                    {primaryBanner?.sub_title ?? 'Get started with SNLift'}
                  </Typography>
                  <Button
                    title='Book Now'
                    onPress={() => navigate(SCREENS.BOOK_RIDE)}
                    style={styles.bookNow}
                    textStyle={styles.bookNowText}
                  />
                </View>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </AppGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.bodySection, { backgroundColor: COLORS.BACKGROUND }]}>
          <Typography style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            What do you need?
          </Typography>
          <View style={styles.services}>
            <ServiceCard
              label='Book a Ride'
              subLabel={'Get Anywhere\nSafely'}
              SvgIcon={SVG.BOOK_RIDE}
              onPress={() => navigate(SCREENS.BOOK_RIDE)}
            />
            <ServiceCard
              label='Send Parcel'
              subLabel={'Fast\nDelivery'}
              SvgIcon={SVG.SEND_PARCEL}
              onPress={() => navigate(SCREENS.SEND_PARCEL)}
            />
            <ServiceCard
              label='Order Food'
              subLabel={'From Top\nRestaurant'}
              SvgIcon={SVG.ORDER_FOOD}
              onPress={() => navigate(SCREENS.ORDER_FOOD)}
            />
          </View>
        </View>

        <View
          style={[styles.bodySection, styles.promoSection, { backgroundColor: COLORS.BACKGROUND }]}
        >
          <View style={styles.promoHeader}>
            <Typography style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
              Promo Codes
            </Typography>
          </View>
          {loading && promoCodes.length === 0 ? (
            <ActivityIndicator color={COLORS.APP_PRIMARY} />
          ) : promoCodes.length === 0 ? (
            <Typography style={{ color: COLORS.TEXT_SECONDARY }}>No promos available</Typography>
          ) : (
            promoCodes.map(p => (
              <View key={p.id} style={[styles.promoCard]}>
                <SvgComponent
                  Svg={SVG.COUPON}
                  svgWidth={40}
                  svgHeight={40}
                  containerStyle={{ ...STYLES.SHADOW, padding: 10, borderRadius: 100 }}
                />
                <View style={styles.promoBody}>
                  <Typography style={[styles.promoCode, { color: COLORS.APP_SECONDARY }]}>
                    {p.code}
                  </Typography>
                  <Typography style={[styles.promoDesc, { color: COLORS.TEXT_SECONDARY }]}>
                    {p.desc}
                  </Typography>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.scrollFooter} />
      </ScrollView>
    </Wrapper>
  );
};

const ServiceCard = ({
  label,
  subLabel,
  SvgIcon,
  svgSize = 70,
  onPress,
}: {
  label: string;
  subLabel: string;
  SvgIcon: React.FC<SvgProps>;
  svgSize?: number;
  onPress: () => void;
}) => (
  <Pressable
    style={[styles.serviceCard, { backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER }]}
    onPress={onPress}
  >
    <SvgComponent Svg={SvgIcon} svgWidth={svgSize} svgHeight={svgSize} />
    <Typography style={[styles.serviceLabel, { color: COLORS.TEXT }]} numberOfLines={2}>
      {label}
    </Typography>
    <Typography style={[styles.serviceSub, { color: COLORS.TEXT_SECONDARY }]} numberOfLines={2}>
      {subLabel}
    </Typography>
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomRightRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  locPillWrap: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  locLabel: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
  },
  locText: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
  },
  greet: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.SemiBold,
  },
  sub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSize.Small,
    marginTop: 4,
    marginBottom: 16,
  },
  bannerLoader: {
    height: 180,
    marginBottom: 10,
  },
  banner: {
    height: 180,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.APP_MAP_BG,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  bannerText: {
    position: 'absolute',
    left: 15,
    right: 22,
    bottom: 22,
  },
  bannerTitle: {
    color: COLORS.WHITE,
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.SemiBold,
  },
  bannerSub: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumSmall,
  },
  bookNow: {
    alignSelf: 'flex-start',
    padding: 10,
    backgroundColor: COLORS.APP_PRIMARY,
    width: screenWidth(30),
    marginTop: 10,
  },
  bookNowText: {
    fontSize: FontSize.MediumSmall,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  promoSection: {
    marginBottom: 24,
    paddingBottom: 8,
  },
  scrollFooter: {
    height: 48,
  },
  bodySection: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.SemiBold,
    marginBottom: 4,
  },
  services: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 24,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  serviceLabel: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
  },
  serviceSub: {
    fontSize: FontSize.ExtraSmall,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 15,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    padding: 7,
    gap: 15,
    marginBottom: 10,
    backgroundColor: COLORS.SURFACE,
    borderColor: COLORS.BORDER,
  },
  promoBody: {
    flex: 1,
  },
  promoCode: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
  promoDesc: {
    fontSize: FontSize.Small,
    marginTop: 2,
  },
});
