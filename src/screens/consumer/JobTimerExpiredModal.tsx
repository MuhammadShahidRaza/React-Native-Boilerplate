import { StyleSheet, View } from 'react-native';
import { Button, GradientIcon, ModalComponent, Typography } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

type Props = {
  visible: boolean;
  title?: string;
  description?: string;
  onSearchAgain: () => void;
  onCancel: () => void;
};

export const JobTimerExpiredModal = ({
  visible,
  title = 'No Match Found',
  description = 'We could not find a driver in time. Search again or cancel this booking.',
  onSearchAgain,
  onCancel,
}: Props) => (
  <ModalComponent
    modalVisible={visible}
    setModalVisible={() => undefined}
    position='center'
    wantToCloseOnBack={false}
    modalContainerStyle={styles.modalShell}
    modalSecondaryContainerStyle={styles.modalCard}
  >
    <View style={styles.content}>
      <GradientIcon
        componentName={VARIABLES.Feather}
        iconName='clock'
        size={28}
        color={COLORS.WHITE}
        containerSize={72}
        borderRadius={36}
      />
      <Typography style={styles.title}>{title}</Typography>
      <Typography style={styles.description}>{description}</Typography>
      <Button title='Search Again' onPress={onSearchAgain} style={styles.primaryBtn} />
      <Button
        title='Cancel Booking'
        onPress={onCancel}
        style={styles.secondaryBtn}
        textStyle={styles.secondaryBtnTxt}
      />
    </View>
  </ModalComponent>
);

const styles = StyleSheet.create({
  modalShell: {
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
    marginTop: 4,
  },
  description: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 28,
    marginTop: 8,
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: COLORS.APP_DANGER_BG,
    borderRadius: 28,
  },
  secondaryBtnTxt: {
    color: COLORS.RED,
    fontWeight: FontWeight.SemiBold,
  },
});
