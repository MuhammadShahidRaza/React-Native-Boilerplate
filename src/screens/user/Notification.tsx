import {Header, MessageBox, Wrapper} from 'components/common';
import {COMMON_TEXT, PRACTITIONER_TEXT} from 'constants/screens';
import {IMAGES} from 'constants/assets';
import {navigate} from 'navigation/Navigators';
import {SCREENS} from 'constants/routes';
import {screenHeight, screenWidth} from 'utils/helpers';
import {FontSize} from 'types/fontTypes';

export const Notification = () => {
  return (
    <Wrapper>
      <Header title={COMMON_TEXT.NOTIFICATIONS} />
      <MessageBox
        imageStyle={{
          borderRadius: 10,
          height: screenHeight(5),
          width: screenWidth(10),
          resizeMode: 'contain',
        }}
        hideBorder
        containerStyle={{marginVertical: 20}}
        onPress={() => navigate(SCREENS.NOTIFICATION_LISTING)}
        userImage={IMAGES.TODAY}
        userName={COMMON_TEXT.TODAY}
        message={PRACTITIONER_TEXT.SESSION_TODAY}
        time="04:20 PM"
      />

      <MessageBox
        imageStyle={{
          borderRadius: 10,
          height: screenHeight(5),
          width: screenWidth(10),
          resizeMode: 'contain',
        }}
        hideBorder
        onPress={() => navigate(SCREENS.NOTIFICATION_LISTING)}
        userImage={IMAGES.SESSION_COMPLETED}
        userName={PRACTITIONER_TEXT.SESSION_COMPLETED}
        messageNumLine={2}
        messageStyle={{
          fontSize: FontSize.MediumSmall,
        }}
        message={PRACTITIONER_TEXT.SESSION_COMPLETED_DESCRIPTION}
        time="02:45 PM"
      />
    </Wrapper>
  );
};
