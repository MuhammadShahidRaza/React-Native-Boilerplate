import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import {StyleType} from 'types/common';
import {COLORS} from 'utils/colors';
import {isIOS} from 'utils/helpers';

interface ModalComponentProps {
  children: React.ReactNode;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  scroll?: boolean;
  transparent?: boolean;
  statusBarTranslucent?: boolean;
  modalContainer?: StyleType;
  wantToCloseOnBack?: boolean;
  wantToCloseOnTop?: boolean;
  onRequestClose?: () => void;
}

export const ModalComponent: React.FC<ModalComponentProps> = ({
  children,
  modalVisible,
  setModalVisible,
  scroll = false,
  transparent = true,
  modalContainer,
  statusBarTranslucent = true,
  wantToCloseOnBack = false,
  wantToCloseOnTop = false,
  onRequestClose,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={transparent}
      visible={modalVisible}
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={() => {
        if (onRequestClose) {
          onRequestClose();
        } else if (wantToCloseOnBack) {
          setModalVisible(false);
        }
      }}>
      <KeyboardAvoidingView
        behavior={isIOS() ? 'padding' : 'height'}
        style={[styles.modalContainer, modalContainer]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (wantToCloseOnTop) {
              setModalVisible(false);
            }
          }}
          style={styles.overlay}
        />
        <View style={[styles.modalContainer, modalContainer]}>
          <View style={styles.modalContent}>
            {scroll ? (
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {children}
              </ScrollView>
            ) : (
              children
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.DARK_BLACK_OPACITY,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.DARK_BLACK_OPACITY,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
});
