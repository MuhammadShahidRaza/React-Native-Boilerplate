import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { Typography, Wrapper } from 'components/common';
import { SCREENS, TEMPORARY_TEXT } from 'constants/index';
import { STYLES } from 'utils/commonStyles';
import { AppScreenProps } from 'types/index';

export const PrivacyPolicy = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.PRIVACY_POLICY>) => {
  const params = route?.params;
  useEffect(() => {
    navigation.setOptions({
      headerTitle: params?.title,
    });
  }, []);
  return (
    <Wrapper useScrollView>
      <View style={styles.container}>
        <Typography>{TEMPORARY_TEXT.LORUM_IPSUM_LONG}</Typography>
        <Typography>{TEMPORARY_TEXT.LORUM_IPSUM_LONG}</Typography>
        <Typography>{TEMPORARY_TEXT.LORUM_IPSUM_LONG}</Typography>
        <Typography>{TEMPORARY_TEXT.LORUM_IPSUM_LONG}</Typography>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
    ...STYLES.GAP_10,
  },
});
