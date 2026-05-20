import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Typography,
  Photo,
  RowComponent,
  SvgComponent,
  GradientButton,
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

// Hero gradient – teal palette (consumer branding, same as original design)

const promoCodes = [
  { code: 'FIRST50', desc: 'CFA 50 off on first ride.' },
  { code: 'FIRST50', desc: 'CFA 50 off on first ride.' },
  { code: 'FIRST50', desc: 'CFA 50 off on first ride.' },
];

export const Home = () => {
  return (
    <Wrapper
      showBackButton={false}
      safeAreaEdges={[]}
      wantPaddingBottom={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      {/* ── Hero section ── */}
      <AppGradient style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            {/* Location pill — gradient square icon + stacked label/text */}
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
            {/* Bell — gradient square icon */}
            <GradientIcon
              componentName={VARIABLES.Feather}
              iconName='bell'
              onPress={() => navigate(SCREENS.NOTIFICATIONS)}
              size={FontSize.Medium}
              color={COLORS.WHITE}
            />
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Typography style={styles.greet}>Hello, Sarah!</Typography>
            <Typography style={styles.sub}>Where would you like to go today?</Typography>

            <Pressable style={styles.banner}>
              <Photo source={IMAGES.HOME} imageStyle={styles.bannerImg} />
              <View style={styles.bannerText}>
                <Typography style={styles.bannerTitle}>First Ride Free!</Typography>
                <Typography style={styles.bannerSub}>Use Code First 50 for Rs. 50 off</Typography>
                <Button
                  title='Book Now'
                  onPress={() => navigate(SCREENS.BOOK_RIDE)}
                  style={styles.bookNow}
                  textStyle={styles.bookNowText}
                />
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </AppGradient>

      {/* ── Scrollable body – theme-aware background ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* "What do you need?" */}
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

        {/* Promo Codes */}
        <View
          style={[styles.bodySection, { backgroundColor: COLORS.BACKGROUND, marginBottom: 70 }]}
        >
          <View style={styles.promoHeader}>
            <Typography style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
              Promo Codes
            </Typography>
            {/* <Typography style={styles.seeAll}>See All</Typography> */}
          </View>
          {promoCodes.map((p, i) => (
            <View key={i} style={[styles.promoCard]}>
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
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Wrapper>
  );
};

// ── Service Card ──────────────────────────────────────────────────────────────
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
  locIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  bellBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  serviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
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
  seeAll: {
    color: COLORS.APP_PRIMARY,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
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
  promoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
