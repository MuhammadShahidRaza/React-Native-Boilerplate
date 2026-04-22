import { View, StyleSheet } from 'react-native';
import { ModalComponent } from './Modal';
import { Icon, IconComponentProps } from './Icon';
import { Typography } from './Typography';
import { RowComponent } from './Row';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { Button } from './Button';
import { COMMON_TEXT } from 'constants/screens';
import { StyleType, TextStyleType } from 'types/common';

interface SuccessFailureModalProps {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onConfirm: () => void;
  iconStyle?: IconComponentProps;
  title?: string;
  description?: string;
  wantToCloseOnBack?: boolean;
  wantToCloseOnTop?: boolean;
  hideButtons?: boolean;
  wantTwoButtons?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  messageTextStyle?: TextStyleType;
  titleTextStyle?: TextStyleType;
  confirmButtonStyle?: StyleType;
  confirmButtonTextStyle?: TextStyleType;
  cancelButtonStyle?: StyleType;
  cancelButtonTextStyle?: TextStyleType;
}

export const SuccessFailureModal: React.FC<SuccessFailureModalProps> = ({
  isVisible,
  setIsVisible,
  onConfirm,
  iconStyle,
  title,
  description,
  wantToCloseOnBack = false,
  wantToCloseOnTop = false,
  wantTwoButtons = true,
  hideButtons = false,
  primaryButtonText = COMMON_TEXT.CONFIRM,
  secondaryButtonText = COMMON_TEXT.CANCEL,
  messageTextStyle,
  titleTextStyle,
  confirmButtonStyle,
  confirmButtonTextStyle,
  cancelButtonStyle,
  cancelButtonTextStyle,
}) => {
  return (
    <ModalComponent
      modalVisible={isVisible}
      setModalVisible={setIsVisible}
      position='center'
      wantToCloseOnTop={wantToCloseOnTop}
      wantToCloseOnBack={wantToCloseOnBack}
    >
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon
            componentName={iconStyle?.componentName ?? VARIABLES.Entypo}
            iconName={iconStyle?.iconName ?? 'check'}
            size={FontSize.Huge}
            color={iconStyle?.color ?? COLORS.BACKGROUND}
          />
        </View>
        {title && <Typography style={[styles.titleText, titleTextStyle]}>{title}</Typography>}
        {description && (
          <Typography style={[styles.messageText, messageTextStyle]}>{description}</Typography>
        )}
        {!hideButtons && (
          <RowComponent style={styles.buttonRow}>
            {wantTwoButtons && (
              <Button
                style={[styles.cancelButton, cancelButtonStyle]}
                textStyle={[styles.cancelButtonText, cancelButtonTextStyle]}
                onPress={() => setIsVisible(false)}
                title={secondaryButtonText}
              />
            )}
            <Button
              style={[styles.confirmButton, confirmButtonStyle]}
              textStyle={[styles.confirmButtonText, confirmButtonTextStyle]}
              onPress={() => {
                setIsVisible(false);
                onConfirm();
              }}
              title={primaryButtonText}
            />
          </RowComponent>
        )}
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    marginBottom: 10,
    borderRadius: 100,
  },
  titleText: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Large,
    textAlign: 'center',
  },
  messageText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    fontSize: FontSize.Small,
  },
  buttonRow: {
    gap: 20,
    flexWrap: 'wrap',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  cancelButtonText: {
    color: COLORS.PRIMARY,
    // fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.MediumSmall,
  },
  confirmButton: {
    flex: 1,
  },
  confirmButtonText: {
    fontSize: FontSize.MediumSmall,
  },
});
