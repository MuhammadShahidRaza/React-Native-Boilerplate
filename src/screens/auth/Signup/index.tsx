import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT, IMAGES, SCREENS, VARIABLES } from 'constants/index';
import {
  COLORS,
  deviceDetails,
  // getFCMToken,
  screenWidth,
  setItem,
  signUpValidationSchema,
} from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Input, AuthComponent, PhoneInputComponent, RowComponent, Checkbox, Photo, Typography, ModalComponent } from 'components/index';
import { signUpUser } from 'api/functions/auth';
import { getCurrentLocation, reverseGeocode } from 'utils/location';
import { useAppDispatch } from 'types/reduxTypes';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { setUserDetails } from 'store/slices/user';
import { navigate } from 'navigation/Navigators';
import { useState } from 'react';

interface SignUpFormValues {
  email: string;
  full_name: string;
  username: string;
  phoneNumber: string;
  password: string;
  country: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  privacyAndPolicy:boolean;
}

export const SignUp = () => {
  const dispatch = useAppDispatch();
  const [showTermsModal, setShowTermsModal] = useState(false);
const [termsAccepted, setTermsAccepted] = useState(false);

  const initialValues: SignUpFormValues = {
    email: __DEV__ ? 'shahid@mailinator.com' : '',
    password: __DEV__ ? 'Passward123!' : '',
    full_name: __DEV__ ? 'Shahid Raza' : '',
    username: __DEV__ ? 'shahid26' : '',
    country: __DEV__ ? 'Pakistan' : '',
    phoneNumber: __DEV__ ? '24244562' : '',
    confirmPassword: __DEV__ ? 'Passward123!' : '',
    showPassword: false,
  privacyAndPolicy:true,

    showConfirmPassword: false,
  };

  const handleSubmit = async (values: SignUpFormValues) => {
    const data: Login_SignUp = {
      email: values?.email,
      password: values?.password,
      full_name: values?.full_name,
      username: values?.username,
      country: values?.country,
      phone: values?.phoneNumber,
      // device_token: await getFCMToken(),
      ...deviceDetails(),
    };
    navigate(SCREENS.VERIFICATION);
    // dispatch(setIsUserLoggedIn(true));
    // setItem(VARIABLES.IS_USER_LOGGED_IN, VARIABLES.IS_USER_LOGGED_IN);
    // signUpUser({ data });
  };
  const formik = useFormikForm<SignUpFormValues>({
    initialValues,
    validationSchema: signUpValidationSchema,
    onSubmit: handleSubmit,
  });

  const getCountry = async () => {
    const position = await getCurrentLocation();
    if (position?.coords) {
      const getAddress = await reverseGeocode({
        latitude: position?.coords?.latitude,
        longitude: position?.coords?.longitude,
      });
      formik.setFieldValue('country', getAddress?.country);
    }
  };

  return (
    <AuthComponent
      heading1={COMMON_TEXT.CREATE_AN_ACCOUNT}
      descriptionStyle={styles.descriptionStyles}
      description={COMMON_TEXT.AUTH_DESC}
      containerStyle={{ marginTop: 0 }}
    >
      <FocusProvider>
        <View style={{justifyContent:'center',alignItems:'center',marginBottom:15}}>
      <Image source={IMAGES.IMAGE_UPLOAD} resizeMode='contain' style={{height:95,alignSelf:'center'}}/>
      <Typography style={{fontSize:FontSize.MediumSmall,marginBottom:5,marginTop:10,color:COLORS.BLACK,fontWeight:'700'}}>Upload Profile Picture</Typography>
      <Typography style={{fontSize:FontSize.Small,color:COLORS.GRAY,fontWeight:'400'}}>Jpeg, Png, Pdf</Typography>
      </View>
        <RowComponent style={{flexDirection:'row',justifyContent:'space-between'}}>
        <Input
          name={COMMON_TEXT.FIRST_NAME}
          containerStyle={{width:screenWidth(40 )}}
          
          title={COMMON_TEXT.FIRST_NAME}
          onChangeText={formik.handleChange('full_name')}
          onBlur={formik.handleBlur('full_name')}
          value={formik.values.full_name}
          placeholder={COMMON_TEXT.ENTER_FULL_NAME}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'user',
          }}
          error={formik.errors.full_name}
          touched={Boolean(formik.touched.full_name && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.LAST_NAME}
          title={COMMON_TEXT.LAST_NAME}
          containerStyle={{width:screenWidth(40)}}
          onChangeText={formik.handleChange('username')}
          onBlur={formik.handleBlur('username')}
          value={formik.values.username}
          placeholder={COMMON_TEXT.ENTER_USER_NAME}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'user',
          }}
          error={formik.errors.username}
          touched={Boolean(formik.touched.username && formik.submitCount)}
        />
        </RowComponent>
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          startIcon={{
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'email-outline',
          }}
          keyboardType={'email-address'}
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
        />

        <PhoneInputComponent
          name={COMMON_TEXT.PHONE_NUMBER}
          title={COMMON_TEXT.PHONE_NUMBER}
          onChangeText={formik.handleChange('phoneNumber')}
          value={formik.values.phoneNumber}
          allowSpacing={true}
          defaultCode={__DEV__ ? 'PK' : 'NG'}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'phone',
          }}
          placeholder={COMMON_TEXT.PHONE_NUMBER}
          error={formik.errors.phoneNumber}
          touched={Boolean(formik.touched.phoneNumber && formik.submitCount)}
        />

        <Input
          name={COMMON_TEXT.PASSWORD}
          title={COMMON_TEXT.PASSWORD}
          onChangeText={formik.handleChange('password')}
          onBlur={formik.handleBlur('password')}
          value={formik.values.password}
          allowSpacing={false}
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock1',
          }}
          placeholder={COMMON_TEXT.ENTER_YOUR_PASSWORD}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () => formik.setFieldValue('showPassword', !formik.values.showPassword),
          }}
          secureTextEntry={!formik.values.showPassword}
          error={formik.errors.password}
          touched={Boolean(formik.touched.password && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.CONFIRM_PASSWORD}
          title={COMMON_TEXT.CONFIRM_PASSWORD}
          onChangeText={formik.handleChange('confirmPassword')}
          onBlur={formik.handleBlur('confirmPassword')}
          value={formik.values.confirmPassword}
          allowSpacing={false}
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock1',
          }}
          placeholder={COMMON_TEXT.ENTER_CONFIRM_PASSWORD}
          returnKeyType='done'
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showConfirmPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () =>
              formik.setFieldValue('showConfirmPassword', !formik.values.showConfirmPassword),
          }}
          secureTextEntry={!formik.values.showConfirmPassword}
          error={formik.errors.confirmPassword}
          touched={Boolean(formik.touched.confirmPassword && formik.submitCount)}
        />
      </FocusProvider>
       <Checkbox
                style={styles.checkbox}
                label={COMMON_TEXT.PRIVACY_POLICY_AND_TC}
                checked={formik.values.privacyAndPolicy}
                labelStyle={styles.TANDCStyles}
                onPress={() => setShowTermsModal(true)}
                checkboxStyle={{borderColor:COLORS.PRIMARY,borderWidth:3,borderRadius:7}}
                onChange={checked => formik.setFieldValue('rememberMe', checked)}
              />
      <Button title={COMMON_TEXT.CONTINUE} onPress={formik.handleSubmit} style={styles.button} />
    <ModalComponent
  modalVisible={showTermsModal}
  setModalVisible={setShowTermsModal}
  scroll
  wantToCloseOnTop
>
  <View style={styles.termsModalBox}>
    <Typography
      style={{
        fontSize: FontSize.ExtraLarge+4,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
      }}
    >
      Terms & Condition | 
Privacy Policy
    </Typography>

    <ScrollView
      showsVerticalScrollIndicator={false}
    >
      <Typography style={{ color: COLORS.GRAY,textAlign:'center',fontSize:FontSize.MediumSmall }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et.
      </Typography>
    </ScrollView>

    <Checkbox
      label="T&C | Privacy Policy"
      checked={termsAccepted}
      onChange={setTermsAccepted}
      labelStyle={{
        fontSize: FontSize.Medium,
        fontWeight: '600',
        color: COLORS.BLACK
      }}
      color={COLORS.BLACK}
      checkboxStyle={{ borderColor: COLORS.PRIMARY, borderWidth: 2 }}
      style={{ marginBottom: 20 }}
    />

    <Button
      title="Continue"
      disabled={!termsAccepted}
      onPress={() => {
        setShowTermsModal(false);
        formik.setFieldValue('privacyAndPolicy', true);
      }}
    />
  </View>
</ModalComponent>

    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  checkbox: {},
  forgotPassword: {
    color: COLORS.ERROR,
  },
  nameinput: {
    width: screenWidth(43),
  },
  row: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  termsModalBox: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 30,
    // padding: 20,
    marginHorizontal: 20,
  },
  button: {
    marginVertical: 30,
    alignSelf:'center'
  },
  descriptionStyles:{
    fontSize:FontSize.MediumSmall,
    color:COLORS.ICONS
  },
  line: {
    width: screenWidth(100),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
  TANDCStyles: {
    color: COLORS.BLACK,
    fontWeight:'700',
    fontSize: FontSize.Medium,
  },
});
