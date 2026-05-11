import { ScrollView, StyleSheet, View, Pressable, Image } from 'react-native';
import type { IconComponentProps } from 'components/common/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Button, Photo } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { IMAGES } from 'constants/assets';
import { COLORS } from 'utils/index';

// Hero gradient – teal palette (consumer branding, same as original design)
const HERO_GRADIENT: [string, string] = ['#0BB89C', '#0A7EA4'];

const promoCodes = [
  { code: 'FIRST50', desc: 'CFA 50 off on first ride.' },
  { code: 'FIRST50', desc: 'CFA 50 off on first ride.' },
];

export const ConsumerHomeHub = () => {
  return (
    <View style={styles.root}>
      {/* ── Hero section ── */}
      <LinearGradient colors={HERO_GRADIENT} style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            <View style={styles.locPillWrap}>
              <View style={styles.locRow}>
                <Icon
                  componentName={VARIABLES.Ionicons}
                  iconName="location-sharp"
                  size={FontSize.Medium}
                  color={COLORS.WHITE}
                />
                <Typography style={styles.locText} numberOfLines={1}>
                  New York, United States
                </Typography>
              </View>
            </View>
            <Pressable style={styles.bell}>
              <View style={styles.bellInner}>
                <Icon
                  componentName={VARIABLES.Feather}
                  iconName="bell"
                  size={FontSize.Medium}
                  color={COLORS.WHITE}
                />
              </View>
            </Pressable>
          </View>

          <Typography style={styles.greet}>Hello, Sarah!</Typography>
          <Typography style={styles.sub}>Where would you like to go today?</Typography>

          <Pressable style={styles.banner}>
            <Photo source={IMAGES.HOME} imageStyle={styles.bannerImg} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.78)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bannerText}>
              <Typography style={styles.bannerTitle}>First Ride Free!</Typography>
              <Typography style={styles.bannerSub}>Use Code First 50 for Rs. 50 off</Typography>
              <Button
                title="Book Now"
                onPress={() => navigate(SCREENS.BOOK_RIDE)}
                style={styles.bookNow}
                textStyle={styles.bookNowText}
              />
            </View>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>

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
              label="Book a Ride"
              subLabel="Get Anywhere Safely"
              icon="car-outline"
              onPress={() => navigate(SCREENS.BOOK_RIDE)}
            />
            <ServiceCard
              label="Send Parcel"
              subLabel="Fast Delivery"
              icon="cube-outline"
              onPress={() => navigate(SCREENS.SEND_PARCEL)}
            />
            <ServiceCard
              label="Order Food"
              subLabel="From Top Restaurant"
              icon="fast-food-outline"
              onPress={() => navigate(SCREENS.ORDER_FOOD)}
            />
          </View>
        </View>

        {/* Promo Codes */}
        <View style={[styles.bodySection, { backgroundColor: COLORS.BACKGROUND }]}>
          <View style={styles.promoHeader}>
            <Typography style={[styles.sectionTitle, { color: COLORS.TEXT }]}>
              Promo Codes
            </Typography>
            <Typography style={styles.seeAll}>See All</Typography>
          </View>
          {promoCodes.map((p, i) => (
            <View
              key={i}
              style={[
                styles.promoCard,
                { backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER },
              ]}
            >
              <View style={[styles.promoIconWrap, { backgroundColor: COLORS.INPUT_BACKGROUND }]}>
                <Icon
                  componentName={VARIABLES.Ionicons}
                  iconName="ticket"
                  size={FontSize.ExtraLarge}
                  color={COLORS.APP_SECONDARY}
                />
              </View>
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
    </View>
  );
};

// ── Service Card ──────────────────────────────────────────────────────────────
const ServiceCard = ({
  label,
  subLabel,
  icon,
  onPress,
}: {
  label: string;
  subLabel: string;
  icon: IconComponentProps['iconName'];
  onPress: () => void;
}) => (
  <Pressable
    style={[styles.serviceCard, { backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER }]}
    onPress={onPress}
  >
    <View style={[styles.serviceIconWrap, { backgroundColor: COLORS.APP_TINT_SOFT }]}>
      <Icon
        componentName={VARIABLES.Ionicons}
        iconName={icon}
        size={28}
        color={COLORS.APP_SECONDARY}
      />
    </View>
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
    borderRadius: 22,
    overflow: 'hidden',
    minHeight: 40,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  locRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  locText: {
    color: COLORS.WHITE,
    flex: 1,
    fontSize: FontSize.Small,
  },
  bell: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bellInner: {
    padding: 8,
  },
  greet: {
    color: COLORS.WHITE,
    fontSize: 26,
    fontWeight: FontWeight.Bold,
    paddingHorizontal: 20,
  },
  sub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSize.Medium,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  banner: {
    marginHorizontal: 16,
    height: 160,
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
    left: 16,
    right: 16,
    bottom: 16,
  },
  bannerTitle: {
    color: COLORS.WHITE,
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSize.Small,
    marginTop: 4,
  },
  bookNow: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.APP_PRIMARY,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  bookNowText: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
  scroll: {
    flex: 1,
    marginTop: -8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bodySection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
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
    paddingVertical: 16,
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
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
  },
  serviceSub: {
    fontSize: FontSize.ExtraSmall,
    textAlign: 'center',
    marginTop: 2,
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
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 14,
    marginBottom: 10,
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
