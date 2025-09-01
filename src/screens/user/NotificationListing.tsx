import { FlatListComponent, MessageBox, Wrapper } from 'components/common';
import { IMAGES } from 'constants/assets';
import { FontSize } from 'types/fontTypes';

export const NotificationListing = () => {
  const renderListing = ({ item }: { item: number }) => (
    <MessageBox
      userImage={IMAGES.USER}
      userName={`Restaurant ${item}`}
      message={'Has approved your reservation request.'}
      messageNumLine={2}
      messageStyle={{ fontSize: FontSize.MediumSmall }}
      time='12:45 PM'
    />
  );
  return (
    <Wrapper useSafeArea={false}>
      <FlatListComponent data={[1, 2, 3, 4, 5, 6]} renderItem={renderListing} />
    </Wrapper>
  );
};
