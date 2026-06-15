import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
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
import { isSengoBrand } from 'constants/assets/brandLogo';
import { getServiceIcon } from 'constants/assets/serviceIcons';
import { COLORS, GRADIENT_END, GRADIENT_START, screenWidth, STYLES } from 'utils/index';
import {
  getHomeData,
  homeHotOffersForDisplay,
  homePromosForDisplay,
  type SnliftHomeBanner,
  type SnliftHomeHotOffer,
  type HomePromoDisplay,
  type SnliftHomeData,
} from 'api/functions/snlift/home';
import type { RootState } from 'types/reduxTypes';
import { getCurrentLocation } from 'utils/location';
import { updateUserLocation } from 'api/functions/app/user';
import { updateWorkerFirestoreLocation } from 'services/location/workerLocation';
import { useCurrentLocation } from 'hooks/useCurrentLocation';
import { getAppSettings } from 'api/functions/snlift/settings';
import type { Address, User } from 'types/responseTypes';

const IS_SENGO = isSengoBrand();

const formatSavedAddress = (addr: Address): string =>
  addr.full_address?.trim() ||
  [addr.city, addr.state, addr.country].filter(Boolean).join(', ') ||
  addr.street?.trim() ||
  '';

const formatProfileLocation = (profile: User | null | undefined): string => {
  const addr = profile?.address;
  if (typeof addr === 'string' && addr.trim()) return addr.trim();
  if (addr && typeof addr === 'object') {
    const fromObject =
      addr.full_address?.trim() || [addr.city, addr.state, addr.country].filter(Boolean).join(', ');
    if (fromObject) return fromObject;
  }
  return [profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ');
};

export const Home = () => {
  const user = useSelector((state: RootState) => state.user.userDetails);
  const addressList = useSelector((state: RootState) => state.address.addressList);
  const locationUpdatedRef = useRef(false);
  const homeLoadedRef = useRef(false);
  const { currentAddress, loading: locationLoading, loadCurrentLocation } = useCurrentLocation();

  // Update user location once when Home tab is visible — REST API + Firestore
  useEffect(() => {
    if (locationUpdatedRef.current || !user?.id) return;
    locationUpdatedRef.current = true;
    (async () => {
      const pos = await getCurrentLocation();
      if (!pos) return;
      const { latitude, longitude } = pos.coords;
      updateUserLocation(latitude, longitude);
      updateWorkerFirestoreLocation(user.id, latitude, longitude, 'user');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    getAppSettings();
  }, []);

  useEffect(() => {
    const defaultAddr = addressList.find(a => a.is_default == 1) ?? addressList[0];
    const savedLocation = defaultAddr ? formatSavedAddress(defaultAddr) : '';
    const profileLocation = formatProfileLocation(user);
    if (!savedLocation && !profileLocation && !currentAddress?.fullAddress) {
      loadCurrentLocation();
    }
  }, [addressList, user, currentAddress?.fullAddress, loadCurrentLocation]);

  const [banners, setBanners] = useState<SnliftHomeBanner[]>([]);
  const [promoCodes, setPromoCodes] = useState<HomePromoDisplay[]>([]);
  const [hotOffers, setHotOffers] = useState<SnliftHomeHotOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const applyHomeData = useCallback((data: SnliftHomeData) => {
    setBanners(data.banners);
    setPromoCodes(homePromosForDisplay(data.promo_codes));
    setHotOffers(
      IS_SENGO ? homeHotOffersForDisplay(data.hot_offers, data.promo_codes) : data.hot_offers,
    );
  }, []);

  const loadHome = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const data = await getHomeData({ showLoader: !isRefresh });
        if (data) {
          applyHomeData(data);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyHomeData],
  );

  useEffect(() => {
    if (homeLoadedRef.current) return;
    homeLoadedRef.current = true;
    loadHome(false);
  }, [loadHome]);

  const primaryBanner = banners[0];

  const displayName = useMemo(() => {
    const fullName = user?.full_name?.trim();
    if (fullName) return fullName.split(/\s+/)[0];
    const firstName = user?.first_name?.trim();
    if (firstName) return firstName;
    return 'Guest';
  }, [user?.full_name, user?.first_name]);

  const displayLocation = useMemo(() => {
    const defaultAddr = addressList.find(a => a.is_default == 1) ?? addressList[0];
    const fromAddressList = defaultAddr ? formatSavedAddress(defaultAddr) : '';
    const fromProfile = formatProfileLocation(user);
    const fromGps = currentAddress?.fullAddress?.trim() ?? '';

    return (
      fromAddressList ||
      fromProfile ||
      fromGps ||
      (locationLoading ? 'Locating...' : 'Location unavailable')
    );
  }, [addressList, user, currentAddress?.fullAddress, locationLoading]);

  return (
    <Wrapper
      showBackButton={false}
      safeAreaEdges={[]}
      wantPaddingBottom={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <AppGradient
        style={styles.hero}
        variant='primary'
        start={IS_SENGO ? GRADIENT_START : { x: 0, y: 0 }}
        end={IS_SENGO ? GRADIENT_END : { x: 0, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            <RowComponent style={styles.locPillWrap}>
              <GradientIcon
                componentName={VARIABLES.EvilIcons}
                iconName='location'
                size={FontSize.ExtraLarge}
                color={COLORS.WHITE}
              />
              <TouchableOpacity
                onPress={() => navigate(SCREENS.LOCATION)}
                style={{ marginLeft: 10 }}
              >
                <Typography style={styles.locLabel}>Location</Typography>
                <Typography style={styles.locText} numberOfLines={1} translate={false}>
                  {displayLocation}
                </Typography>
              </TouchableOpacity>
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

            {loading && !refreshing ? (
              <HomeBannerSkeleton />
            ) : (
              <Pressable style={styles.banner} onPress={() => navigate(SCREENS.BOOK_RIDE)}>
                <Photo
                  source={
                    primaryBanner?.image
                      ? { uri: primaryBanner.image, cache: 'force-cache' }
                      : IMAGES.HOME
                  }
                  imageStyle={styles.bannerImg}
                />
                <View style={styles.bannerText}>
                  <Typography numberOfLines={1} style={styles.bannerTitle}>
                    {primaryBanner?.title ?? 'Book a Ride'}
                  </Typography>
                  <Typography numberOfLines={1} style={styles.bannerSub}>
                    {primaryBanner?.sub_title ??
                      (IS_SENGO ? 'Get started with Sengo' : 'Get started with SNLift')}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHome(true)}
            tintColor={COLORS.APP_PRIMARY}
            colors={[COLORS.APP_PRIMARY]}
          />
        }
      >
        <View style={[styles.bodySection, { backgroundColor: COLORS.BACKGROUND }]}>
          <Typography style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
            What do you need?
          </Typography>
          <View style={styles.services}>
            <ServiceCard
              label='Book a Ride'
              subLabel={'Get Anywhere\nSafely'}
              SvgIcon={getServiceIcon('bookRide')}
              onPress={() => navigate(SCREENS.BOOK_RIDE)}
            />
            <ServiceCard
              label='Send Parcel'
              subLabel={'Fast\nDelivery'}
              SvgIcon={getServiceIcon('sendParcel')}
              onPress={() => navigate(SCREENS.SEND_PARCEL)}
            />
            <ServiceCard
              label='Order Food'
              subLabel={'From Top\nRestaurant'}
              SvgIcon={getServiceIcon('orderFood')}
              onPress={() => navigate(SCREENS.ORDER_FOOD)}
            />
          </View>
        </View>

        {IS_SENGO ? (
          <View
            style={[
              styles.bodySection,
              styles.promoSection,
              { backgroundColor: COLORS.BACKGROUND },
            ]}
          >
            <View style={styles.promoHeader}>
              <Typography style={[styles.sectionTitle, { color: COLORS.TEXT, marginBottom: 0 }]}>
                Hot Offers
              </Typography>
              <Typography style={styles.seeAll} onPress={() => navigate(SCREENS.ORDER_FOOD)}>
                See All
              </Typography>
            </View>
            {loading && !refreshing ? (
              <HomeHotOffersSkeleton />
            ) : (
              hotOffers?.length > 0 &&
              hotOffers?.map(offer => <HotOfferCard key={offer.id} offer={offer} />)
            )}
          </View>
        ) : (
          <View
            style={[
              styles.bodySection,
              styles.promoSection,
              { backgroundColor: COLORS.BACKGROUND },
            ]}
          >
            <View style={styles.promoHeader}>
              <Typography style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
                Promo Codes
              </Typography>
            </View>
            {loading && !refreshing ? (
              <HomePromoSkeleton />
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
        )}

        <View style={styles.scrollFooter} />
      </ScrollView>
    </Wrapper>
  );
};

const HomeBannerSkeleton = () => (
  <SkeletonPlaceholder backgroundColor='#FFFFFF2E' highlightColor='#FFFFFF52'>
    <SkeletonPlaceholder.Item width='100%' height={180} borderRadius={20} marginBottom={10} />
  </SkeletonPlaceholder>
);

const HomeHotOffersSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor={COLORS.SKELETON_BACKGROUND}
    highlightColor={COLORS.SKELETON_HIGHLIGHT}
  >
    {[0, 1].map(i => (
      <SkeletonPlaceholder.Item
        key={i}
        width='100%'
        height={120}
        borderRadius={16}
        marginBottom={12}
      />
    ))}
  </SkeletonPlaceholder>
);

const HomePromoSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor={COLORS.SKELETON_BACKGROUND}
    highlightColor={COLORS.SKELETON_HIGHLIGHT}
  >
    {[0, 1, 2].map(i => (
      <SkeletonPlaceholder.Item
        key={i}
        width='100%'
        height={56}
        borderRadius={100}
        marginBottom={10}
      />
    ))}
  </SkeletonPlaceholder>
);

const HotOfferCard = ({ offer }: { offer: SnliftHomeHotOffer }) => (
  <Pressable style={styles.hotOfferCard} onPress={() => navigate(SCREENS.ORDER_FOOD)}>
    <AppGradient variant='offer' style={StyleSheet.absoluteFill} />
    <View style={styles.hotOfferRow}>
      <View style={styles.hotOfferLogoBox}>
        {offer.image ? (
          <Photo source={{ uri: offer.image }} imageStyle={styles.hotOfferLogoImg} />
        ) : (
          <SvgComponent Svg={SVG.ORDER_FOOD} svgWidth={44} svgHeight={44} />
        )}
      </View>
      <View style={styles.hotOfferBody}>
        <Typography style={styles.hotOfferTitle}>{offer.title}</Typography>
        <Typography style={styles.hotOfferSub}>{offer.sub_title}</Typography>
        <View style={styles.buyNowPill}>
          <Typography style={styles.buyNowPillText}>Buy Now</Typography>
        </View>
      </View>
    </View>
  </Pressable>
);

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
    width: '40%',
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
  banner: {
    height: 180,
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
    // backgroundColor: COLORS.APP_MAP_BG,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    // backgroundColor: COLORS.SECONDARY,
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
  seeAll: {
    color: COLORS.APP_PRIMARY,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
  },
  hotOfferCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 120,
  },
  hotOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  hotOfferLogoBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hotOfferLogoImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  hotOfferBody: {
    flex: 1,
    gap: 4,
  },
  hotOfferTitle: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
  },
  hotOfferSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: FontSize.Small,
  },
  buyNowPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 6,
  },
  buyNowPillText: {
    color: COLORS.APP_SECONDARY,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
  },
});
