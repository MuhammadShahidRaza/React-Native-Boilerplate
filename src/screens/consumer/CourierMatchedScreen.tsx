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
      headerTitle='Courier Matched'
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView={false}
      darkMode={false}
    >
      <View style={styles.body}>
        <GradientIcon
          componentName={VARIABLES.Feather}
          iconName='check'
          size={40}
          color={COLORS.WHITE}
          containerStyle={styles.check}
        />
        <Typography style={styles.headline}>Courier Found!</Typography>

        <View style={styles.card}>
          <Image source={IMAGES.USER} style={styles.avatar} />
          <Typography style={styles.name}>John Doe</Typography>
          <View style={styles.ratingRow}>
            <Icon
              componentName={VARIABLES.Ionicons}
              iconName='star'
              size={FontSize.Small}
              color={COLORS.APP_STAR}
            />
            <Typography style={styles.rating}>4.9</Typography>
          </View>
          <View style={styles.feeBlock}>
            <Typography style={styles.feeLabel}>Delivery Fee</Typography>
            <Typography style={styles.feeAmt}>CFA 100</Typography>
            <Typography style={styles.cash}>Cash Payment</Typography>
          </View>
          <View style={styles.stats}>
            <Stat icon='motorbike' label='Vehicle Type' value='YAMAHA' />
            <View style={styles.div} />
            <Stat icon='card-text-outline' label='License Plate' value='AA-001-AA' />
            <View style={styles.div} />
            <Stat icon='water' label='Color' value='Black' />
          </View>
        </View>

        <Button
          title='Track Delivery'
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
    fontSize: FontSize.XL,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    marginBottom: 20,
  },
  card: {
    width: '80%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 28,
  },
  name: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.ExtraLarge,
    color: COLORS.APP_TEXT,
    marginTop: 3,
  },
  rating: {
    // fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT,
    marginBottom: -4,
  },
  feeBlock: {
    borderColor: COLORS.APP_LINE,
    paddingTop: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  feeLabel: {
    color: COLORS.APP_TEXT_SMALL,
    fontSize: FontSize.Small,
  },
  feeAmt: {
    fontSize: FontSize.XXL,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  cash: {
    color: COLORS.APP_PRIMARY,
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
    width: '90%',
    marginTop: 100,
    backgroundColor: COLORS.APP_SECONDARY,
  },
  ctaText: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
  },
});
