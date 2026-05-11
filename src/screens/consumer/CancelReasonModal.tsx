import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Button } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, APP_GRADIENT_PRIMARY } from 'utils/index';

type Props = {
  visible: boolean;
  onClose: () => void;
  onContinue: (reason: string) => void;
};

export const CancelReasonModal = ({ visible, onClose, onContinue }: Props) => {
  const [reason, setReason] = useState('');

  const handleContinue = () => {
    onContinue(reason);
    setReason('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} style={styles.iconCircle}>
            <Icon
              componentName={VARIABLES.Feather}
              iconName="x"
              size={FontSize.ExtraLarge}
              color={COLORS.WHITE}
            />
          </LinearGradient>
          <Typography style={styles.heading}>Reason For Cancelling</Typography>
          <TextInput
            style={styles.input}
            placeholder="Type Here..."
            placeholderTextColor={COLORS.APP_TEXT_MUTED}
            multiline
            value={reason}
            onChangeText={setReason}
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            style={styles.btn}
            textStyle={styles.btnText}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: COLORS.APP_TEXT,
  },
  btn: {
    width: '100%',
    backgroundColor: COLORS.APP_SECONDARY,
    borderRadius: 999,
  },
  btnText: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
  },
});
