import { StyleSheet, View } from 'react-native';
import { ModalComponent } from './Modal';
import { AppGradient, Button, GradientIcon, Typography } from 'components/index';
import type { IconComponentProps } from './Icon';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export interface AppStatusModalProps {
  visible: boolean;
  onClose: () => void;
  onPrimaryPress: () => void;
  title: string;
  description: string;
  primaryButtonText: string;
  iconProps: Pick<IconComponentProps, 'componentName' | 'iconName' | 'size'>;
  wantCloseOnBackdrop?: boolean;
}

export const AppStatusModal = ({
  visible,
  onClose,
  onPrimaryPress,
  title,
  description,
  primaryButtonText,
  iconProps,
  wantCloseOnBackdrop = false,
}: AppStatusModalProps) => (
  <ModalComponent
    modalVisible={visible}
    setModalVisible={v => {
      if (!v) onClose();
    }}
    position='center'
    wantToCloseOnBack={wantCloseOnBackdrop}
    modalContainerStyle={styles.modalShell}
    modalSecondaryContainerStyle={styles.modalCard}
  >
    <View style={styles.content}>
      <GradientIcon
        {...iconProps}
        color={COLORS.WHITE}
        size={iconProps.size ?? 32}
        containerSize={72}
        borderRadius={36}
      />
      <Typography style={styles.title}>{title}</Typography>
      <Typography style={styles.description}>{description}</Typography>
      <Button
        title={primaryButtonText}
        onPress={() => {
          onClose();
          onPrimaryPress();
        }}
        style={styles.primaryBtn}
        textStyle={styles.primaryBtnTxt}
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
  primaryBtnTxt: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
  },
});
