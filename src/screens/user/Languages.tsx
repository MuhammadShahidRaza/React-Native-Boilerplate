import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { FlatListComponent, Photo, RowComponent, Typography, Wrapper } from 'components/common';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { useTranslation } from 'hooks/useTranslation';
import { STYLES } from 'utils/commonStyles';
import { onBack } from 'navigation/Navigators';
import { SearchBar } from 'components/appComponents';
import { IMAGES } from 'constants/assets';
import { FontSize } from 'types/fontTypes';
import { setAppLanguage } from 'store/slices/appSettings';
import { VARIABLES } from 'constants/common';
import { setItem } from 'utils/storage';

export const Language = () => {
  const dispatch = useAppDispatch();
  const appLanguage = useAppSelector(state => state.app.appLanguage);
  const { changeLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(appLanguage);
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = () => {
    setSelectedLanguage(selectedLanguage);
    changeLanguage(selectedLanguage);
    dispatch(setAppLanguage(selectedLanguage));
    setItem(VARIABLES.LANGUAGE, selectedLanguage);
    onBack();
  };

  const languages = [
    {
      name: 'English (UK)',
      image: IMAGES.ENGLISH,
    },
    // LANGUAGES.ARABIC,
    // LANGUAGES.SPANISH,
    // LANGUAGES.DUTCH,
    // LANGUAGES.PORTUGUESE,
    // LANGUAGES.GERMAN,
  ];

  const renderItem = ({ item }: { item: any }) => {
    return (
      <RowComponent
        style={styles.rowComponent}
        onPress={() => {
          handleSubmit();
        }}
      >
        <Photo source={item?.image} style={STYLES.USER_IMAGE} resizeMode='contain' />
        <Typography style={styles.languageName}>{item?.name}</Typography>
      </RowComponent>
    );
  };

  return (
    <Wrapper useScrollView={false} useSafeArea={false}>
      <View style={styles.container}>
        <SearchBar
          value={searchValue}
          onChangeText={setSearchValue}
          secondContainerStyle={{ ...STYLES.SHADOW, marginTop: 10 }}
          showBorder={false}
        />
        <FlatListComponent
          style={styles.flatList}
          data={languages?.filter(item =>
            item?.name?.toLowerCase()?.includes(searchValue?.toLowerCase()),
          )}
          renderItem={renderItem}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
  },
  flatList: {
    marginTop: 30,
  },
  rowComponent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
  },
  languageName: {
    textTransform: 'capitalize',
    fontSize: FontSize.MediumLarge,
    marginTop: 10,
  },
});
