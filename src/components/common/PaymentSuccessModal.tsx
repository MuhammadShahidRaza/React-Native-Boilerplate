import { Modal, StyleSheet, View } from 'react-native';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { GradientButton } from './GradientButton';
import { GradientIcon } from './GradientIcon';
import { Typography } from './Typography';

interface PaymentSuccessModalProps {
  visible: boolean;
  onContinue: () => void;
}

export const PaymentSuccessModal = ({ visible, onContinue }: PaymentSuccessModalProps) => (
  <Modal visible={visible} transparent animationType='fade' statusBarTranslucent>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <GradientIcon
          componentName={VARIABLES.MaterialCommunityIcons}
          iconName='check-all'
          size={52}
          color={COLORS.WHITE}
          containerSize={120}
          borderRadius={60}
          containerStyle={styles.iconShadow}
        />
        <Typography style={styles.title}>Payment Successful</Typography>
        <GradientButton
          title='Continue'
          onPress={onContinue}
          style={styles.button}
        />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 24,
  },
  iconShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: FontSize.ExtraExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    textAlign: 'center',
    lineHeight: 38,
  },
  button: {
    alignSelf: 'stretch',
  },
});
