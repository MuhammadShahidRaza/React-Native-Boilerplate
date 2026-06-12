import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppStatusModal, Button, Icon, RowComponent, Wrapper } from 'components/common';
import { useWorkerProfileGate } from 'hooks/useWorkerProfileGate';
import { showToast } from 'utils/toast';
import { VARIABLES } from 'constants/common';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate, onBack } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { screenHeight } from 'utils/helpers';
import { SuccessFailureModal } from 'components/common/SuccessFailureModal';
import { COMMON_TEXT } from 'constants/index';
import { AppScreenProps } from 'types/navigation';
import { SelectedMedia } from 'hooks/useMediaPicker';
import { useResetStackOnBack } from 'hooks/useResetStackOnBack';
import { getAuthStackLoginIndex, getAuthStackRoutes } from 'config/authFlow';
import { useAppSelector } from 'types/reduxTypes';
import { syncWorkerOnboardingFlags } from 'utils/workerOnboarding';

export interface CompleteProfileFormValues {
  address?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  latitude?: string;
  longitude?: string;
  is_notify?: string;
  service_id?: string;
  experience?: string;
  radius?: string;
  area?: string;
  zip_code?: string;
  driving_license_number?: string;
  driver_license_number?: string;
  driver_license_validity_date?: string;
  social_security_number?: string;
  issue_date?: string;
  driver_license_front?: SelectedMedia | null | string;
  driver_license_back?: SelectedMedia | null | string;
  driving_license_front?: SelectedMedia | null | string;
  driving_license_back?: SelectedMedia | null | string;
  mot_certificate?: SelectedMedia | null | string;
  business_license?: SelectedMedia | null | string;
  business_license_front?: SelectedMedia | null | string;
  insurance_document?: SelectedMedia | null | string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_license_plate?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  vehicle_type?: string;
  vehicle_make?: string;
}

export const CompleteProfile = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.COMPLETE_PROFILE>) => {
  const isFromSettings = route.params?.isFromSettings || false;
  const user = useAppSelector(state => state.user.userDetails);
  const isPendingForApproval = Boolean(!user?.is_admin_verified && user?.is_onboarded);
  const profileGate = useWorkerProfileGate();

  useEffect(() => {
    syncWorkerOnboardingFlags(user);
  }, [user]);

  const openDocuments = () => {
    if (!profileGate.vehicleComplete) {
      showToast({
        message: 'Please save your vehicle details first.',
        isError: true,
      });
      profileGate.setDetailsRequiredVisible(true);
      return;
    }
    navigate(SCREENS.DOCUMENTATION_UPLOAD, { isFromSettings });
  };

  const tabs = [
    {
      title: 'Vehicle Details',
      onPress: () => navigate(SCREENS.VEHICLE_DETAILS, { isFromSettings }),
    },
    {
      title: 'Documents',
      onPress: openDocuments,
    },
    ...(isFromSettings
      ? [
          {
            title: 'My Profile',
            iconName: 'user-circle',
            onPress: () => navigate(SCREENS.PROFILE),
            iconComponent: VARIABLES.FontAwesome,
          },
        ]
      : []),
  ];

  if (!isFromSettings) {
    useResetStackOnBack(navigation, {
      index: getAuthStackLoginIndex(),
      routes: getAuthStackRoutes(),
    });
  }

  return (
    <Wrapper headerTitle={isFromSettings ? 'My Account' : 'Complete Profile'}>
      <View
        style={{
          height: screenHeight(70),
          margin: 20,
        }}
      >
        <View style={styles.tabsContainer}>
          {tabs.map(({ title, onPress }, index) => (
            <RowComponent
              style={[
                styles.rowContainer,
                { borderBottomWidth: index === tabs.length - 1 ? 0 : 1 },
              ]}
              onPress={onPress}
              key={title}
            >
              <Button
                key={title}
                onPress={onPress}
                containerStyle={styles.buttonContainer}
                title={title}
                textStyle={styles.buttonText}
                style={styles.button}
              />
              <Icon
                componentName={VARIABLES.Entypo}
                iconName={'chevron-small-right'}
                color={COLORS.ICONS}
                iconStyle={{ marginRight: 10 }}
                size={FontSize.Large}
              />
            </RowComponent>
          ))}
        </View>
      </View>

      {/* {!isFromSettings && <Button title='Submit'
        disabled={
          !isBothSubmitted.isProfessionalDetailsSubmitted || !isBothSubmitted.isDocumentationUploadSubmitted
        }
        onPress={async () => {
          setIsVisible(true);
          // if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
          //   const userData = { ...DUMMY_USER, user_type: role };
          //   dispatch(setIsUserLoggedIn(true));
          //   dispatch(setUserDetails(userData));
          //   await setKeychainItem(VARIABLES.USER_TOKEN, 'temp_token');
          //   return;
          // }
        }}
        style={styles.submitButton}
      />} */}
      {/* <SuccessFailureModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => {
          setIsVisible(false);
          onBack()
        }}
        title={COMMON_TEXT.REQUEST_SUBMITTED_SUCCESSFULLY}
        description={COMMON_TEXT.YOUR_REQUEST_HAS_BEEN_SUBMITTED_TO_THE_ADMIN_YOU_WILL_BE_INFORMED_ONCE_APPROVED}
        primaryButtonText={COMMON_TEXT.BACK_TO_LOGIN}
        wantTwoButtons={false}
        iconStyle={{ componentName: VARIABLES.Entypo, iconName: 'check', color: COLORS.BACKGROUND }}
      /> */}
      <SuccessFailureModal
        isVisible={isPendingForApproval}
        setIsVisible={() => {}}
        onConfirm={() => {
          onBack();
        }}
        title={COMMON_TEXT.PENDING_FOR_APPROVAL}
        description={
          COMMON_TEXT.YOUR_REQUEST_HAS_BEEN_SUBMITTED_TO_THE_ADMIN_YOU_WILL_BE_INFORMED_ONCE_APPROVED
        }
        primaryButtonText={COMMON_TEXT.BACK_TO_LOGIN}
        wantTwoButtons={false}
        iconStyle={{ componentName: VARIABLES.Entypo, iconName: 'check', color: COLORS.BACKGROUND }}
      />

      <AppStatusModal
        visible={profileGate.detailsRequiredVisible}
        onClose={profileGate.dismissDetailsRequired}
        onPrimaryPress={() => {
          profileGate.dismissDetailsRequired();
          navigate(SCREENS.VEHICLE_DETAILS, { isFromSettings });
        }}
        title='Details Required'
        description='You need to submit the required details in order to continue.'
        primaryButtonText='Add Vehicle'
        iconProps={{
          componentName: VARIABLES.MaterialCommunityIcons,
          iconName: 'file-document-outline',
          size: 30,
        }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  submitButton: {
    marginHorizontal: 20,
  },
  rowContainer: {
    borderBottomColor: COLORS.BORDER,
    borderBottomWidth: 0.5,
  },
  buttonContainer: {
    justifyContent: 'flex-start',
    gap: 20,

    padding: 18,
    borderRadius: 15,
  },
  button: {
    padding: 0,
    backgroundColor: COLORS.TRANSPARENT,
  },
  buttonText: {
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT,
  },
  tabsContainer: {
    borderRadius: 10,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.TEXT_INVERSE,
  },
  switch: {
    marginRight: 10,
  },
});
