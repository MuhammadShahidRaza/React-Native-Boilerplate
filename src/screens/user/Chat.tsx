import { memo, useCallback } from 'react';
import { FlatListComponent, Header, MessageBox, Wrapper } from 'components/common';
import { COMMON_TEXT, TEMPORARY_TEXT } from 'constants/screens';
import { IMAGES } from 'constants/assets';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
interface ChatItem {
  id: number;
}

const MemoizedMessageBox = memo(MessageBox);

export const Chat = () => {
  const chatList: ChatItem[] = [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 3 }];

  const renderChats = useCallback(
    ({ item }: { item: ChatItem }) => (
      <MemoizedMessageBox
        key={item?.id}
        onPress={() => navigate(SCREENS.CHAT)}
        userImage={IMAGES.USER}
        userNameDescription={TEMPORARY_TEXT.DAYS_3}
        userName={TEMPORARY_TEXT.JOHN_DOE}
        message={TEMPORARY_TEXT.LORUM_IPSUM}
        time='12:45 PM'
      />
    ),
    [],
  );

  return (
    <Wrapper>
      <Header title={COMMON_TEXT.MESSAGES} />
      <FlatListComponent data={chatList} renderItem={renderChats} />
    </Wrapper>
  );
};
