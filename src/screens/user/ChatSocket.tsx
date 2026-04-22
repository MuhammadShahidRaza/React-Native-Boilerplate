import { memo, useCallback, useEffect, useState } from 'react';
import { SearchBar } from 'components/appComponents';
import { FlatListComponent, MessageBox, Typography, Wrapper } from 'components/common';
import { navigate } from 'navigation/Navigators';
import { STYLES, COLORS } from 'utils/index';
import { View } from 'react-native';
import { FontSize } from 'types/fontTypes';
import { SOCKET_EVENTS, SCREENS, TEMPORARY_TEXT, IMAGES } from 'constants/index';
import useSocket from 'hooks/useSocket';
interface ChatItem {
  id: number;
}

const MemoizedMessageBox = memo(MessageBox);

export const ChatSocket = () => {
  const [searchText, setSearchText] = useState('');
  const { on, off } = useSocket();

  useEffect(() => {
    const handleConversationUpdate = () => {
      // New message in a conversation – refresh list or update unread when you have API
      // setConversations(prev => [...]);
    };
    on(SOCKET_EVENTS.MESSAGE, handleConversationUpdate);
    return () => {
      off(SOCKET_EVENTS.MESSAGE);
    };
  }, [on, off]);

  const chatList: ChatItem[] = [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }];

  const renderChats = useCallback(
    ({ item }: { item: ChatItem }) => (
      <View style={{ position: 'relative' }}>
        <MemoizedMessageBox
          key={item?.id}
          containerStyle={{
            paddingVertical: 15,
            gap: 20,
            borderBottomWidth: 0.5,
          }}
          onPress={() => navigate(SCREENS.MESSAGES_SOCKET)}
          userImage={IMAGES.USER_IMAGE}
          imageStyle={{
            width: 50,
            height: 50,
            borderRadius: 50,
          }}
          messageNumLine={2}
          messageStyle={{
            color: COLORS.PLACEHOLDER,
          }}
          userName={TEMPORARY_TEXT.JOHN_DOE}
          message={'Hello, how are you?'}
          time='12:45 PM'
          timeStyle={{ marginBottom: 20 }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 15,
            right: 30,
            backgroundColor: COLORS.PRIMARY,
            borderRadius: 50,
            padding: 2,
            width: 30,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography style={{ color: COLORS.WHITE, fontSize: FontSize.Small }}>10</Typography>
        </View>
      </View>
    ),
    [],
  );

  return (
    <Wrapper headerTitle={'My Chats'} showBackButton={false}>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        showBorder={false}
        containerStyle={{
          ...STYLES.SHADOW,
          marginHorizontal: 30,
          marginBottom: 20,
          borderRadius: 50,
          backgroundColor: COLORS.SURFACE,
        }}
      />
      <FlatListComponent scrollEnabled={true} data={chatList} renderItem={renderChats} />
    </Wrapper>
  );
};
