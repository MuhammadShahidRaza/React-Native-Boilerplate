import { StyleSheet, View, Image } from 'react-native';
import { Icon, Typography, Button, Wrapper, GradientIcon } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { IMAGES } from 'constants/assets';
import { COLORS } from 'utils/index';

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

export const CourierMatchedScreen = () => {
  return (
    <Wrapper
      headerTitle="Courier Matched"
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView={false}
      darkMode={false}
    >
      <View style={styles.body}>
        <GradientIcon
          componentName={VARIABLES.Feather}
          iconName="check"
          size={40}
          color={COLORS.WHITE}
          containerStyle={styles.check}
        />
        <Typography style={styles.headline}>Courier Found!</Typography>

        <View style={styles.card}>
          <View style={styles.profileRow}>
            <Image source={IMAGES.USER} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Typography style={styles.name}>John Doe</Typography>
              <View style={styles.ratingRow}>
                <Icon
                  componentName={VARIABLES.Ionicons}
                  iconName="star"
                  size={FontSize.Small}
                  color={COLORS.APP_STAR}
                />
                <Typography style={styles.rating}>4.9</Typography>
              </View>
            </View>
          </View>
          <View style={styles.feeBlock}>
            <Typography style={styles.feeLabel}>Delivery Fee</Typography>
            <Typography style={styles.feeAmt}>CFA 100</Typography>
            <Typography style={styles.cash}>Cash Payment</Typography>
          </View>
          <View style={styles.stats}>
            <Stat icon="motorbike" label="Vehicle Type" value="YAMAHA" />
            <View style={styles.div} />
            <Stat icon="card-text-outline" label="License Plate" value="AA-001-AA" />
            <View style={styles.div} />
            <Stat icon="water" label="Color" value="Black" />
          </View>
        </View>

        <Button
          title="Track Delivery"
          onPress={() => navigate(SCREENS.TRACK_PARCEL, { phase: 'picked_up' })}
          style={styles.cta}
          textStyle={styles.ctaText}
        />
      </View>
    </Wrapper>
  );
};

const Stat = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.stat}>
    <Icon
      componentName={VARIABLES.MaterialCommunityIcons}
      iconName={icon}
      size={22}
      color={COLORS.APP_PRIMARY}
    />
    <Typography style={styles.statVal}>{value}</Typography>
    <Typography style={styles.statLbl}>{label}</Typography>
  </View>
);

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  check: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  headline: {
    fontSize: 22,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  name: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Large,
    color: COLORS.APP_TEXT,
  },
  rating: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT,
  },
  feeBlock: {
    borderTopWidth: 1,
    borderColor: COLORS.APP_LINE,
    paddingTop: 12,
    marginBottom: 12,
  },
  feeLabel: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
  feeAmt: {
    fontSize: 24,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginTop: 4,
  },
  cash: {
    color: COLORS.APP_PRIMARY,
    fontWeight: FontWeight.Bold,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    fontSize: FontSize.Small,
  },
  statLbl: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.ExtraSmall,
  },
  div: {
    width: 1,
    backgroundColor: COLORS.APP_LINE,
    marginHorizontal: 4,
  },
  cta: {
    width: '100%',
    backgroundColor: COLORS.APP_SECONDARY,
    borderRadius: 14,
  },
  ctaText: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
  },
});
