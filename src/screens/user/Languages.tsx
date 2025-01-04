import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {Button, Header, RadioButton, Wrapper} from 'components/common';
import {COMMON_TEXT} from 'constants/screens';
import {LANGUAGES, VARIABLES} from 'constants/common';
import {useAppDispatch, useAppSelector} from 'types/reduxTypes';
import {useTranslation} from 'hooks/useTranslation';
import {setAppLanguage} from 'store/slices/appSettings';
import {setItem} from 'utils/storage';
import {screenWidth} from 'utils/helpers';
import {STYLES} from 'utils/commonStyles';
import {onBack} from 'navigation/Navigators';

export const Language = () => {
  const dispatch = useAppDispatch();
  const appLanguage = useAppSelector(state => state.app.appLanguage);
  const {changeLanguage} = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(appLanguage);

  const handleSubmit = () => {
    changeLanguage(selectedLanguage);
    dispatch(setAppLanguage(selectedLanguage));
    setItem(VARIABLES.LANGUAGE, selectedLanguage);
    onBack();
  };

  const languages = [
    LANGUAGES.ENGLISH,
    LANGUAGES.ARABIC,
    LANGUAGES.SPANISH,
    LANGUAGES.DUTCH,
    LANGUAGES.PORTUGUESE,
    LANGUAGES.GERMAN,
  ];

  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.LANGUAGES} />
      <View style={styles.container}>
        <RadioButton
          containerStyle={styles.radioButtonContainer}
          optionsContainerStyle={styles.radioButtonOptionsContainer}
          options={languages}
          selectedOption={selectedLanguage}
          onSelectOption={setSelectedLanguage}
        />
        <Button
          style={styles.submitButton}
          onPress={handleSubmit}
          title={COMMON_TEXT.SUBMIT}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
  },
  radioButtonContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  radioButtonOptionsContainer: {
    width: screenWidth(90),
    marginTop: 10,
    flexDirection: 'row-reverse',
  },
  submitButton: {
    marginVertical: 100,
  },
});
