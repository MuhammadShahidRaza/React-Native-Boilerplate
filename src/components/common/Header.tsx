import { View, StyleSheet, StyleProp, TextStyle, SafeAreaView, TouchableOpacity } from 'react-native';
import { RowComponent } from './Row';
import { Icon } from './Icon';
import { LANGUAGES, VARIABLES } from 'constants/common';
import { FontSize, FontWeight, ChildrenType } from 'types/index';
import { Typography } from './Typography';
import { onBack } from 'navigation/index';
import { Photo } from './Photo';
import { COLORS } from 'utils/colors';
import { useTranslation } from 'hooks/useTranslation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import i18n from 'i18n/index';

type Props = {
  endIcon?: ChildrenType;
  backIconStyle?: StyleProp<TextStyle>;
  title?: string;
  centerImage?: string;
  onPressBack?: () => void;
};


const BackButton = ({ onBack, backIconStyle }: any) => {
  return (
    <TouchableOpacity
      onPress={onBack}
      style={[styles.backIcon, backIconStyle]}
    >
      <MaterialIcons
        name="arrow-back-ios"
        size={FontSize.Large}
        color={COLORS.BLACK}
        style={{
          transform: [{ scaleX: i18n.language === LANGUAGES.ARABIC ? -1 : 1 }], marginStart: 10
        }}
      />
    </TouchableOpacity>
  )
}

export const Header = ({
  endIcon,
  title = '',
  backIconStyle,
  centerImage = '',
  onPressBack = () => onBack(),
}: Props) => {
  const { isLangRTL } = useTranslation();
  return (
    <SafeAreaView>
      <RowComponent style={styles.headerContainer}>
        <BackButton backIconStyle={backIconStyle} onBack={onPressBack} />
        <RowComponent style={styles.titleContainer}>
          {centerImage && (
            <Photo source={centerImage} imageStyle={styles.image} />
          )}
          <Typography style={styles.headerText}>{title}</Typography>
        </RowComponent>
        <View style={styles.endIconContainer}>{endIcon}</View>
      </RowComponent>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  iconStyle: {
    flex: 1,
    color: COLORS.SECONDARY,
  },
  headerText: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
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
  backIcon: {
    height: 32,
    width: 32,
    backgroundColor: COLORS.WHITE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.62,

    elevation: 4,
  }
});
