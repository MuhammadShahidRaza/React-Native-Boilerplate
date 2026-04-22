import { View, StyleSheet } from 'react-native';
import { ModalComponent } from '../common/Modal';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { VARIABLES } from 'constants/common';

interface ValidationErrorModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  visible,
  onClose,
  title = 'Invalid Message',
  message,
}) => {
  return (
    <ModalComponent
      modalVisible={visible}
      setModalVisible={() => onClose()}
      position='center'
      wantToCloseOnBack={true}
      closeIcon={true}
      wantToCloseOnTop={true}
    >
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName='alert-circle'
            size={48}
            color={COLORS.ERROR}
          />
        </View>
        <Typography style={styles.title}>{title}</Typography>
        <Typography style={styles.message}>{message}</Typography>
        <Button
          title='Got it'
          onPress={onClose}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${COLORS.ERROR}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 140,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
  },
});
