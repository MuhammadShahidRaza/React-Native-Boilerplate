import { Button, Icon, Input, PhoneInputComponent, Photo, Wrapper } from 'components/common';
import { IMAGES, VARIABLES } from 'constants/index';
import { COMMON_TEXT } from 'constants/screens';
import { FocusProvider } from 'hooks/useFocus';
import { useFormikForm } from 'hooks/useFormik';
import { onBack } from 'navigation/Navigators';
import { StyleSheet, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER, STYLES } from 'utils/commonStyles';
import { screenHeight, screenWidth } from 'utils/helpers';
import { getCurrentLocation, reverseGeocode } from 'utils/location';
import { editProfileValidationSchema } from 'utils/validations';

interface EditProfileFormValues {
  email: string;
  full_name: string;
  username: string;
  phoneNumber: string;
  country: string;
}

export const EditProfile = () => {
  //   const dispatch = useAppDispatch();
  const initialValues: EditProfileFormValues = {
    email: __DEV__ ? 'john@mailinator.com' : 'john@mailinator.com',
    full_name: __DEV__ ? 'John Doe' : '',
    username: __DEV__ ? 'john26' : '',
    country: __DEV__ ? 'Nigeria' : '',
    phoneNumber: __DEV__ ? '324244242' : '',
  };

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

  const handleSubmit = async (values: EditProfileFormValues) => {
    onBack();
  };

  const formik = useFormikForm<EditProfileFormValues>({
    initialValues,
    validationSchema: editProfileValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Wrapper useScrollView={true} useSafeArea={false}>
      <View style={STYLES.CONTAINER}>
        <FocusProvider>
          <View style={styles.profileHeader}>
            <View style={styles.photoContainer}>
              <Photo source={IMAGES.USER_IMAGE} resizeMode='contain' imageStyle={styles.photo} />
              <Icon
                componentName={VARIABLES.Entypo}
                iconName={'camera'}
                onPress={() => {}}
                color={COLORS.PRIMARY}
                iconStyle={styles.editIcon}
              />
            </View>
          </View>
          <Input
            name={COMMON_TEXT.FULL_NAME}
            title={COMMON_TEXT.FULL_NAME}
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
            name={COMMON_TEXT.USERNAME}
            title={COMMON_TEXT.USERNAME}
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
          <Input
            name={COMMON_TEXT.EMAIL}
            title={COMMON_TEXT.EMAIL}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            value={formik.values.email}
            allowSpacing={false}
            editable={false}
            startIcon={{
              componentName: VARIABLES.MaterialCommunityIcons,
              iconName: 'email-outline',
            }}
            keyboardType={'email-address'}
            placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
            error={formik.errors.email}
            touched={Boolean(formik.touched.email && formik.submitCount)}
          />
          <Input
            name={COMMON_TEXT.COUNTRY}
            title={COMMON_TEXT.COUNTRY}
            onChangeText={formik.handleChange('country')}
            onBlur={formik.handleBlur('country')}
            value={formik.values.country}
            placeholder={COMMON_TEXT.ENTER_COUNTRY}
            startIcon={{
              componentName: VARIABLES.MaterialIcons,
              iconName: 'language',
            }}
            endIcon={{
              componentName: VARIABLES.MaterialIcons,
              iconName: 'my-location',
              size: FontSize.Large,
              onPress: () => {
                getCountry();
              },
            }}
            error={formik.errors.country}
            touched={Boolean(formik.touched.country && formik.submitCount)}
          />
          <PhoneInputComponent
            name={COMMON_TEXT.PHONE_NUMBER}
            title={COMMON_TEXT.PHONE_NUMBER}
            onChangeText={formik.handleChange('phoneNumber')}
            value={formik.values.phoneNumber}
            allowSpacing={false}
            defaultCode={__DEV__ ? 'PK' : 'NG'}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'phone',
            }}
            placeholder={COMMON_TEXT.PHONE_NUMBER}
            error={formik.errors.phoneNumber}
            touched={Boolean(formik.touched.phoneNumber && formik.submitCount)}
          />
        </FocusProvider>
        <Button title={COMMON_TEXT.UPDATE} onPress={formik.handleSubmit} style={styles.button} />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  nameinput: {
    width: screenWidth(43),
  },
  row: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  profileHeader: {
    marginBottom: 10,
    ...FLEX_CENTER,
  },
  photoContainer: {
    marginVertical: 20,
    ...FLEX_CENTER,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    padding: 7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  photo: {
    width: screenWidth(30),
    height: screenHeight(14),
    borderWidth: 1,
    padding: 5,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.PRIMARY,
    borderRadius: screenWidth(35),
  },
  button: {
    marginVertical: 20,
  },
  changePasswordText: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.MediumLarge,
    textAlign: 'center',
    marginBottom: 20,
  },
  line: {
    width: screenWidth(100),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
  title: {
    fontWeight: FontWeight.Bold,
  },
  spacing: { marginBottom: 10 },
});
