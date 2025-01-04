import {View, StyleSheet, StyleProp, TextStyle} from 'react-native';
import {RowComponent} from './Row';
import {Icon} from './Icon';
import {VARIABLES} from 'constants/common';
import {FontSize, FontWeight, ChildrenType} from 'types/index';
import {Typography} from './Typography';
import {onBack} from 'navigation/index';
import {Photo} from './Photo';
import {COLORS} from 'utils/colors';
import {useTranslation} from 'hooks/useTranslation';

type Props = {
  endIcon?: ChildrenType;
  backIconStyle?: StyleProp<TextStyle>;
  title?: string;
  centerImage?: string;
  onPressBack?: () => void;
};

export const Header = ({
  endIcon,
  title = '',
  backIconStyle,
  centerImage = '',
  onPressBack = () => onBack(),
}: Props) => {
  const {isLangRTL} = useTranslation();
  return (
    <RowComponent style={styles.headerContainer}>
      <Icon
        iconStyle={[
          styles.iconStyle,
          {transform: [{scaleX: isLangRTL ? -1 : 1}]},
          backIconStyle,
        ]}
        componentName={VARIABLES.Ionicons}
        iconName={'chevron-back-sharp'}
        size={FontSize.Large}
        onPress={onPressBack}
      />
      <RowComponent style={styles.titleContainer}>
        {centerImage && (
          <Photo source={centerImage} imageStyle={styles.image} />
        )}
        <Typography style={styles.headerText}>{title}</Typography>
      </RowComponent>
      <View style={styles.endIconContainer}>{endIcon}</View>
    </RowComponent>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  iconStyle: {
    flex: 1,
    color: COLORS.MUD_TEXT,
  },
  headerText: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Black,
    textAlign: 'center',
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
  },
});
