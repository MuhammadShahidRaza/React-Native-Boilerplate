import { View, StyleSheet } from 'react-native';
import { ModalComponent } from './Modal';
import { Icon } from './Icon';
import { Typography } from './Typography';
import { RowComponent } from './Row';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { Button } from './Button';
import { screenWidth } from 'utils/helpers';

interface LogoutModalProps {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  isDelete?: boolean;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isVisible,
  setIsVisible,
  isDelete = false,
  onConfirm,
}) => {
  return (
    <ModalComponent
      modalVisible={isVisible}
      setModalVisible={setIsVisible}
      position='center'
      wantToCloseOnTop={true}
      wantToCloseOnBack={true}
    >
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon
            componentName={isDelete ? VARIABLES.MaterialIcons : VARIABLES.AntDesign}
            iconName={isDelete ? 'delete-outline' : 'logout'}
            size={FontSize.Huge}
            color={COLORS.WHITE}
          />
        </View>
        <Typography style={styles.titleText}>Are you sure?</Typography>
        <Typography style={styles.messageText}>
          {`You want to ${isDelete ? 'delete' : 'logout'} your account?`}
        </Typography>
        <RowComponent style={styles.buttonRow}>
          <Button
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            title='Cancel'
            onPress={() => setIsVisible(false)}
          />
          <Button
            style={styles.confirmButton}
            textStyle={styles.confirmButtonText}
            title={isDelete ? 'Delete' : 'Logout'}
            onPress={() => {
              setIsVisible(false);
              onConfirm();
            }}
          />
        </RowComponent>
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 5,
  },
  iconWrapper: {
    backgroundColor: COLORS.ERROR,
    padding: 15,
    marginBottom: 10,
    borderRadius: 100,
  },
  titleText: {
    fontWeight: FontWeight.SemiBold,
  },
  messageText: {
    textAlign: 'center',
    fontWeight: FontWeight.SemiBold,
  },
  buttonRow: {
    gap: 20,
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    width: screenWidth(30),
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  cancelButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: FontWeight.SemiBold,
  },
  confirmButton: {
    padding: 10,
    width: screenWidth(30),
    backgroundColor: COLORS.PRIMARY,
  },
  confirmButtonText: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.WHITE,
  },
});
