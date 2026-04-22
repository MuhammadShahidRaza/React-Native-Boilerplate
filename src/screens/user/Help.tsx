import { StyleSheet, View } from 'react-native';
import { Button, Header, Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, SETTINGS_TEXT, TEMPORARY_TEXT } from 'constants/screens';
import { STYLES } from 'utils/commonStyles';
import { FontSize, FontWeight } from 'types/fontTypes';

export const Help = () => {
  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.HELP_AND_SUPPORT} />
      <View style={styles.container}>
        <Typography style={styles.description}>{TEMPORARY_TEXT.LORUM_IPSUM_TOO_LONG}</Typography>
        <Typography style={styles.helpText}>{SETTINGS_TEXT.WE_ARE_HERE_TO_HELP}</Typography>
        <Button title={COMMON_TEXT.LETS_CONNECT} />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: { ...STYLES.GAP_15, ...STYLES.CONTAINER, marginBottom: 20 },
  description: {
    lineHeight: 22,
  },
  helpText: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Black,
    textAlign: 'center',
  },
});
