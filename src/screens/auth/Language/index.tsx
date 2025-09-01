import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Dropdown,
  DropdownItemProps,
  FlatListComponent,
  Icon,
  Photo,
  RowComponent,
  Typography,
  AuthComponent,
} from 'components/index';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';
import { LANGUAGES, VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';
import { useTranslation } from 'hooks/useTranslation';
import { IMAGES } from 'constants/assets/images';
import { setAppLanguage } from 'store/slices/appSettings';
import { useAppDispatch } from 'types/reduxTypes';
import { setItem } from 'utils/storage';
import { FLEX_CENTER, screenWidth } from 'utils/index';

type RenderItemProps = {
  item: DropdownItemProps;
  index: number;
};
export const Language = () => {
  const { isLangRTL, changeLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES.ENGLISH);
  const handleNext = () => {
    changeLanguage(selectedLanguage);
    setItem(VARIABLES.LANGUAGE, selectedLanguage);
    dispatch(setAppLanguage(selectedLanguage));
  };

  const languages: DropdownItemProps[] = [
    { name: LANGUAGES.ENGLISH, image: IMAGES.ENGLISH },
    { name: LANGUAGES.ARABIC, image: IMAGES.ARABIC },
    { name: LANGUAGES.SPANISH, image: IMAGES.SPANISH },
    { name: LANGUAGES.DUTCH, image: IMAGES.DUTCH },
    { name: LANGUAGES.PORTUGUESE, image: IMAGES.PORTUGUESE },
    { name: LANGUAGES.GERMAN, image: IMAGES.GERMAN },
  ];

  const renderItem = ({ item, index }: RenderItemProps) => (
    <Photo
      key={index}
      onPress={() => {
        setSelectedLanguage(item.name);
      }}
      source={item?.image ?? IMAGES.ENGLISH}
      imageStyle={styles.imageStyle}
    />
  );

  return (
    <AuthComponent bottomText='' bottomButtonText=''>
      <View style={{ flex: 1, zIndex: 1 }}>
        <Typography style={styles.titleText}>{COMMON_TEXT.CHOOSE_LANGUAGE}</Typography>

        <FlatListComponent
          data={languages}
          numColumns={3}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
          scrollEnabled={false}
        />
        <View style={FLEX_CENTER}>
          <Dropdown
            options={languages}
            selectedValue={selectedLanguage}
            onSelect={setSelectedLanguage}
            width={screenWidth(60)}
            containerStyle={{
              borderColor: COLORS.PRIMARY,
            }}
          />
        </View>
      </View>

      <RowComponent
        isRightLeftJustify
        activeOpacity={0.5}
        onPress={handleNext}
        style={styles.skipButton}
      >
        <Typography style={styles.skipButtonText}>{COMMON_TEXT.NEXT}</Typography>
        <Icon
          size={FontSize.ExtraLarge}
          componentName={VARIABLES.AntDesign}
          color={COLORS.PRIMARY}
          iconName={isLangRTL ? 'arrowleft' : 'arrowright'}
        />
      </RowComponent>
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
    fontSize: FontSize.Large,
    marginVertical: 20,
  },
  skipButton: {
    zIndex: 2,
    width: 100,
    padding: 20,
    gap: 5,
    alignSelf: 'flex-end',
    marginTop: 100,
  },
  skipButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.Large,
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  imageStyle: {
    width: 84,
    height: 52,
    margin: 8,
    alignItems: 'center',
  },
});
