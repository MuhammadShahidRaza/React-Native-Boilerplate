import { View, StyleSheet, StyleProp, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { ReactNode } from 'react';
import { RowComponent } from './Row';
import { FontSize, FontWeight, ChildrenType } from 'types/index';
import { Typography } from './Typography';
import { CustomBackIcon, onBack } from 'navigation/index';
import { Photo } from './Photo';
import { COLORS } from 'utils/colors';

type Props = {
  endIcon?: ChildrenType | (() => ReactNode);
  backIconStyle?: StyleProp<TextStyle>;
  title?: string;
  showBackButton?: boolean;
  centerImage?: string;
  onPressBack?: () => void;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  subtitle?: string;
  subtitleTextStyle?: StyleProp<TextStyle>;
  subtitleContainerStyle?: StyleProp<ViewStyle>;
  headerContainerStyle?: StyleProp<ViewStyle>;
  titleContainerStyle?: StyleProp<ViewStyle>;
  centerImageStyle?: StyleProp<ImageStyle>;
};

export const Header = ({
  endIcon,
  title = '',
  backIconStyle,
  centerImage = '',
  onPressBack = () => onBack(),
  showBackButton = false,
  titleStyle,
  subtitle,
  subtitleTextStyle,
  subtitleContainerStyle,
  headerContainerStyle,
  titleContainerStyle,
  centerImageStyle,
}: Props) => {
  const renderedEndIcon = typeof endIcon === 'function' ? endIcon() : endIcon;

  return (
    <RowComponent style={[styles.headerContainer, headerContainerStyle]}>
      {showBackButton ? (
        <CustomBackIcon onPress={onPressBack} style={backIconStyle} />
      ) : (
        <View style={styles.iconStyle} />
      )}
      <RowComponent style={[styles.titleContainer, titleContainerStyle]}>
        {centerImage && (
          <Photo source={centerImage} imageStyle={[styles.image, centerImageStyle]} />
        )}
        <View style={[styles.subtitleContainer, subtitleContainerStyle]}>
          <Typography numberOfLines={2} style={[styles.headerText, titleStyle]}>
            {title}
          </Typography>
          {subtitle && (
            <Typography numberOfLines={1} style={[styles.subtitleText, subtitleTextStyle]}>
              {subtitle}
            </Typography>
          )}
        </View>
      </RowComponent>
      <View style={styles.endIconContainer}>{renderedEndIcon}</View>
    </RowComponent>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 20,
    paddingVertical: 15,
  },
  iconStyle: {
    flex: 1,
    color: COLORS.SECONDARY,
  },
  headerText: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  endIconContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  titleContainer: {
    flex: 5,
    gap: 8,
    justifyContent: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  subtitleText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  subtitleContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});
