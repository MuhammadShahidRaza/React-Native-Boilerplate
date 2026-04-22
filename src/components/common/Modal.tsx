import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { FontSize, StyleType } from 'types/index';
import { COLORS, isIOS, STYLES } from 'utils/index';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { useEffect, useMemo, useState } from 'react';

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
  closeIcon?: boolean;
  closeIconStyle?: StyleType;
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
  closeIcon = false,
  closeIconStyle,
  onRequestClose,
  position = 'bottom',
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true); // or some other action
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false); // or some other action
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const keyboardBehavior = useMemo(() => {
    if (isIOS()) {
      return 'padding';
    }
    // For Android, use 'height' when keyboard is visible, otherwise undefined
    return isKeyboardVisible ? 'height' : undefined;
  }, [isKeyboardVisible]);

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
        behavior={keyboardBehavior}
        // keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
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
            {closeIcon && (
              <Icon
                onPress={() => setModalVisible(false)}
                componentName={VARIABLES.Entypo}
                iconName='cross'
                size={FontSize.ExtraLarge}
                color={COLORS.WHITE}
                iconStyle={[styles.closeIcon, closeIconStyle]}
              />
            )}
            {scroll ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps='handled'
              >
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
    backgroundColor: COLORS.SURFACE,
  },
  closeIcon: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: -5,
    padding: 5,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 100,
    top: -10,
    zIndex: 1000,
  },
});
