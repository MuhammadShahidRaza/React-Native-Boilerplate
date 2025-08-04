import { View, StyleSheet, ImageStyle, TextStyle } from 'react-native';
import { Photo } from './Photo';
import { RowComponent } from './Row';
import { COLORS } from 'utils/colors';
import { Typography } from './Typography';
import { FontSize, FontWeight, StyleType, voidFuntionType } from 'types/index';
import { isIOS } from 'utils/helpers';
import { Icon, IconComponentProps } from './Icon';
import { STYLES } from 'utils/commonStyles';

type Props = {
  userImage: string | number | null | undefined;
  messageNumLine?: number;
  userName: string | undefined;
  userNameDescription?: string;
  message: string;
  time?: string;
  hideBorder?: boolean;
  containerStyle?: StyleType;
  imageStyle?: ImageStyle;
  userNameStyle?: TextStyle;
  messageStyle?: TextStyle;
  timeStyle?: TextStyle;
  endIcon?: IconComponentProps;
  onPress?: voidFuntionType;
};
export const MessageBox = ({
  userImage,
  userName,
  userNameDescription = '',
  message,
  endIcon,
  time = '',
  timeStyle,
  userNameStyle,
  messageNumLine = 1,
  imageStyle,
  onPress,
  messageStyle,
  containerStyle,
  hideBorder = false,
}: Props) => {
  return (
    <RowComponent
      onPress={onPress}
      style={[
        styles.container,
        {
          borderBottomWidth: hideBorder ? 0 : 1,
        },
        containerStyle,
      ]}
    >
      <Photo disabled source={userImage} imageStyle={[styles.userImage, imageStyle]} />
      <View style={styles.messageContent}>
        <RowComponent style={{ justifyContent: 'flex-start', gap: 5 }}>
          <Typography numberOfLines={1} style={[styles.userName, userNameStyle]}>
            {userName}
          </Typography>
          {userNameDescription && (
            <Typography numberOfLines={1} style={styles.userNameDescription}>
              {userNameDescription}
            </Typography>
          )}
        </RowComponent>
        <Typography numberOfLines={messageNumLine} style={[styles.message, messageStyle]}>
          {message}
        </Typography>
      </View>
      <RowComponent style={STYLES.GAP_5}>
        {endIcon && <Icon {...endIcon} iconStyle={endIcon?.iconStyle} />}
        <Typography style={[styles.time, timeStyle]}>{time}</Typography>
      </RowComponent>
    </RowComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderBottomColor: COLORS.BORDER,
    paddingVertical: 10,
    gap: 12,
  },
  userImage: {
    width: 40,
    height: 40,
    borderWidth: 0.5,
    borderColor: COLORS.BORDER,
    borderRadius: 20,
  },
  messageContent: {
    flex: 1,
    gap: 3,
    justifyContent: 'center',
  },
  userName: {
    fontWeight: FontWeight.Bold,
  },
  message: {
    color: COLORS.MEDIUM_GREY,
  },
  userNameDescription: {
    color: COLORS.SECONDARY,
    marginBottom: isIOS() ? 3 : 0,
    fontSize: FontSize.MediumSmall,
  },
  time: {
    fontSize: FontSize.Small,
    color: COLORS.DARK_GREY,
  },
});
