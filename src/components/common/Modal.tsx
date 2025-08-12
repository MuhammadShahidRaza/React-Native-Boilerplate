import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { StyleType } from 'types/common';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { isIOS } from 'utils/helpers';

interface ModalComponentProps {
  children: React.ReactNode;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  scroll?: boolean;
  transparent?: boolean;
  statusBarTranslucent?: boolean;
  modalContainerStyle?: StyleType;
  modalSecondaryContainerStyle?: StyleType;
  wantToCloseOnBack?: boolean;
  wantToCloseOnTop?: boolean;
  onRequestClose?: () => void;
  position?: 'center' | 'bottom';
}

export const ModalComponent: React.FC<ModalComponentProps> = ({
  children,
  modalVisible,
  setModalVisible,
  scroll = false,
  transparent = true,
  modalContainerStyle,
  modalSecondaryContainerStyle,
  statusBarTranslucent = true,
  wantToCloseOnBack = false,
  wantToCloseOnTop = false,
  onRequestClose,
  position = 'bottom',
}) => {
  return (
    <Modal
      animationType='slide'
      transparent={transparent}
      visible={modalVisible}
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={() => {
        if (onRequestClose) {
          onRequestClose();
        } else if (wantToCloseOnBack) {
          setModalVisible(false);
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={isIOS() ? 'padding' : 'height'}
        style={[
          styles.modalContainer,
          position === 'center' ? styles.centeredContainer : styles.bottomContainer,
          modalContainerStyle,
        ]}
      >
        <View
          style={[
            { flex: 1 },
            position === 'center' ? styles.centeredContainer : styles.bottomContainer,
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              if (wantToCloseOnTop) {
                setModalVisible(false);
              }
            }}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              styles.modalInnerWrapper,
              position === 'center' ? styles.centeredModal : styles.bottomModal,
              position === 'center' && styles.centeredModalLayout,
              modalSecondaryContainerStyle,
            ]}
          >
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
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.MEDIUM_BLACK_OPACITY,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
  },
  centeredContainer: {
    justifyContent: 'center',
  },
  bottomModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  centeredModal: {
    borderRadius: 20,
  },
  centeredModalLayout: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalInnerWrapper: {
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    ...STYLES.SHADOW,
  },
});
