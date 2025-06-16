import { FlatListComponent, Header, MessageBox, Wrapper } from 'components/common';
import { COMMON_TEXT, TEMPORARY_TEXT } from 'constants/screens';
import { IMAGES } from 'constants/assets';

export const NotificationListing = () => {
  const renderListing = () => (
    <MessageBox
      userImage={IMAGES.USER}
      userName={TEMPORARY_TEXT.JOHN_DOE}
      message={TEMPORARY_TEXT.LORUM_IPSUM}
      time='12:45 PM'
    />
  );
  return (
    <Wrapper>
      <Header title={COMMON_TEXT.NOTIFICATIONS} />
      <FlatListComponent data={[1, 2, 3, 4, 5, 6]} renderItem={renderListing} />
    </Wrapper>
  );
};
