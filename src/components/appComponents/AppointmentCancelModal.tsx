import { View, StyleSheet } from 'react-native';
import { ModalComponent, RowComponent, Typography, Button } from 'components/index';
import { COMMON_TEXT } from 'constants/index';
import { screenWidth } from 'utils/helpers';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';

interface AppointmentCancelModalProps {
  id: string;
  showCancelModal: boolean;
  setShowCancelModal: (visible: boolean) => void;
  handleConfirm: (id: string) => void;
  handleCancel: () => void;
}

export const AppointmentCancelModal: React.FC<AppointmentCancelModalProps> = ({
  id,
  showCancelModal,
  setShowCancelModal,
  handleConfirm,
  handleCancel,
}) => {
  return (
    <ModalComponent modalVisible={showCancelModal} setModalVisible={setShowCancelModal}>
      <View style={styles.modalContent}>
        <Typography style={styles.modalTitle}>{COMMON_TEXT.RADIUS}</Typography>
        <RowComponent style={styles.modalRow}>
          <Button
            style={styles.cancelButton}
            title={COMMON_TEXT.NO}
            onPress={() => handleCancel()}
          />
          <Button
            style={styles.confirmButton}
            title={COMMON_TEXT.YES}
            onPress={() => handleConfirm(id)}
          />
        </RowComponent>
        <Typography style={styles.modalNote}>{COMMON_TEXT.RADIUS}</Typography>
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.MediumLarge,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalRow: {
    gap: 12,
    marginVertical: 15,
  },
  cancelButton: {
    width: screenWidth(35),
    backgroundColor: COLORS.GRAY,
  },
  confirmButton: {
    width: screenWidth(35),
  },
  modalNote: {
    lineHeight: 25,
    textAlign: 'center',
  },
});
