import { Image, StyleSheet, View } from 'react-native';
import { COMMON_TEXT, IMAGES, VARIABLES } from 'constants/index';
import { COLORS, resetPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { Button, Input, AuthComponent, Wrapper, Header, Typography } from 'components/index';
import { LanguageSelectorButton } from 'components/common/LanguageSelectorButton';

interface ChangePasswordFormValues {
  new_password: string;
  confirm_password: string;
  showConfirmPassword: boolean;
  showNewPassword: boolean;
}

export const ContactSupport = () => {
  const initialValues: ChangePasswordFormValues = {
    new_password: __DEV__ ? 'Passward123!' : '',
    confirm_password: __DEV__ ? 'Passward123!' : '',
    showConfirmPassword: false,
    showNewPassword: false,
  };

  const formik = useFormikForm<ChangePasswordFormValues>({
    initialValues,
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async values => {
      const data = {
        password: values?.new_password,
        password_confirmation: values?.confirm_password,
      };
      // resetUserPassword({data});
    },
  });

  return (
    <Wrapper>
      <Header title={'Contact Support'} />
      <View style={styles.container}>
        <View style={styles.content}>
            <Image source={IMAGES.CHAT_ICON} resizeMode='contain' style={{height:196,alignSelf:'center'}}/>
            <Typography style={{fontSize:FontSize.ExtraLarge,fontWeight:FontWeight.Bold,marginBottom:10,textAlign:'center' }}>How can we help
you?    </Typography>
          <Typography style={styles.description}>
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
            }
          </Typography>
<Button
            title={COMMON_TEXT.LETS_CONNECT}
            onPress={formik.handleSubmit}
            style={styles.button}
          />
        </View>

       <View style={styles.footer}>
  <View style={styles.liveAgentLineContainer}>
    <Typography style={styles.liveAgentLabel}>Connect With Live Agent</Typography>
    <View style={styles.progressBarBackground}>
      <View style={styles.progressBarFill} />
    </View>
  </View>

</View>

      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 60,
    paddingTop: 60,
  },
  liveAgentLineContainer: {
  marginBottom: 16,
  alignItems: 'center',
},
liveAgentLabel: {
  fontSize: FontSize.Small,
  color: COLORS.LANGUAGE_COLOR,
  marginBottom: 8,
},
progressBarBackground: {
  width: '100%',
  height: 8,
  borderColor:COLORS.PRIMARY,
  borderWidth:1,
  marginBottom:90,
  backgroundColor: COLORS.PRIMARY, // greyed background
  borderRadius: 10,
},
progressBarFill: {
  width: '60%', // You can make this dynamic based on status
  height: 6,

  backgroundColor: COLORS.WHITE,
  borderRadius: 10,
},

  description: {
    fontSize: FontSize.Small,
    color: COLORS.LANGUAGE_COLOR,
    textAlign: 'center',
    marginBottom: 20,
  },
  languageButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  footer: {
    paddingHorizontal: 90,
    paddingBottom: 30,
    
  },
  button: {
    alignSelf: 'center',

  },
});
