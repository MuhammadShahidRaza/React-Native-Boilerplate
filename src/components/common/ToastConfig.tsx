import { View, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast, ToastProps } from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';

const renderToast =
  (ToastComponent: typeof BaseToast, borderColor: string, iconName: string, iconColor: string) =>
  (props: ToastProps) => (
    <ToastComponent
      {...props}
      style={[
        styles.toastContainer,
        {
          backgroundColor: COLORS.SURFACE,
          borderLeftColor: borderColor,
        },
      ]}
      contentContainerStyle={styles.contentContainer}
      text1Style={[styles.text1, { color: COLORS.TEXT }]}
      text2Style={[styles.text2, { color: COLORS.TEXT_SECONDARY }]}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View style={[styles.iconContainer, { backgroundColor: `${borderColor}20` }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
      )}
    />
  );

export const toastConfig = {
  success: renderToast(BaseToast, COLORS.GREEN_STATUS, 'checkmark-circle', COLORS.GREEN_STATUS),

  error: renderToast(ErrorToast, COLORS.ERROR, 'close-circle', COLORS.ERROR),

  info: renderToast(InfoToast, COLORS.PRIMARY, 'information-circle', COLORS.PRIMARY),
};

const styles = StyleSheet.create({
  toastContainer: {
    height: null,
    width: '90%',
    borderRadius: 14,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  text1: {
    flexWrap: 'wrap', // ✅ important
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    marginBottom: 2,
  },
  text2: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    lineHeight: 18,
    flexWrap: 'wrap', // ✅ important
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});
