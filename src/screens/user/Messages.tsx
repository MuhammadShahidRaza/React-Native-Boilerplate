import {
  FlatListComponent,
  Header,
  Icon,
  Input,
  RowComponent,
  Typography,
  Wrapper,
} from 'components/common';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT, TEMPORARY_TEXT } from 'constants/screens';
import { useState } from 'react';
import { View, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { screenWidth } from 'utils/helpers';
import { FLEX_CENTER } from '../../utils/commonStyles/index';
import { IMAGES } from 'constants/assets';
import { useTranslation } from 'hooks/useTranslation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  createdAt: Date;
  profilePic?: string;
}

// interface SectionData {
//   title: string;
//   data: Message[];
// }
// Function to group messages by date
const groupMessagesByDate = (messages: Message[]) => {
  const sections = messages.reduce((acc, message) => {
    const date = message.createdAt.toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  return Object.keys(sections).map(date => ({
    data: sections[date],
    title: date,
  }));
};

export const Messages = () => {
  const { isLangRTL } = useTranslation();
  const tempList: Message[] = [
    {
      id: '1',
      text: 'Hello #Username, How can I help you?',
      sender: 'other',
      createdAt: new Date(),
    },
    {
      id: '2',
      text: 'Hey doc, we had a session 3 days ago, but sadly I am feeling pain in my cuts.',
      sender: 'user',
      createdAt: new Date(),
    },
    {
      id: '3',
      text: 'Did you take precautions as suggested?',
      sender: 'other',
      createdAt: new Date(),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(tempList);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        text: inputText,
        sender: 'user',
        createdAt: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  const renderMessage = ({ item }: { item: Message }) => {
    const timeString = item.createdAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <RowComponent
        style={[
          styles.row,
          {
            justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        {/* {item.sender === 'other' && item.profilePic && (
        <Photo source={IMAGES.USER} imageStyle={styles.profilePic} />
      )} */}
        <View
          style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userMessage : styles.otherMessage,
          ]}
        >
          <View style={styles.messageContent}>
            <Typography
              style={item.sender === 'user' ? styles.userMessageText : styles.otherMessageText}
            >
              {item.text}
            </Typography>
            <Typography style={styles.timestamp}>{timeString}</Typography>
          </View>
        </View>
      </RowComponent>
    );
  };

  const previousSearchList = [
    { id: '1', searchName: 'Yes' },
    { id: '2', searchName: 'Yeah Ok' },
    { id: '3', searchName: 'Sure!' },
    { id: '4', searchName: 'Ok' },
    { id: '5', searchName: '👍' },
  ];
  const handlePress = (searchName: string) => {
    setInputText(prev => prev + ` ${searchName}`);
  };

  const renderItem = ({ item }: { item: { id: string; searchName: string } }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handlePress(item.searchName)}>
      <Typography numberOfLines={1} style={styles.itemText}>
        {item.searchName}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <>
      <Wrapper>
        <Header title={TEMPORARY_TEXT.JOHN_DOE} centerImage={IMAGES.USER} />
        <SectionList
          sections={groupedMessages}
          renderItem={renderMessage}
          renderSectionHeader={({ section }) => {
            const dateObj = new Date(section.title);
            const formattedDate =
              `${dateObj.getDate()} ` +
              dateObj.toLocaleDateString(undefined, {
                month: 'short',
              }) +
              `,  ${dateObj.getFullYear()}`;
            return (
              <View style={styles.sectionHeaderContainer}>
                <Typography style={styles.sectionHeader}>{formattedDate}</Typography>
              </View>
            );
          }}
          keyExtractor={item => item.id}
        />

        <FlatListComponent
          horizontal
          style={{ marginLeft: 15 }}
          data={previousSearchList}
          renderItem={renderItem}
        />
        <RowComponent style={styles.inputContainer}>
          <Input
            name={COMMON_TEXT.EMAIL}
            onChangeText={setInputText}
            containerStyle={{ width: screenWidth(78) }}
            value={inputText}
            placeholder={COMMON_TEXT.WRITE_MESSAGE}
            endIcon={{
              componentName: VARIABLES.FontAwesome5,
              iconName: 'plus-circle',
              color: COLORS.ICONS,
              iconStyle: { paddingRight: 0 },
              size: FontSize.ExtraLarge,
              onPress: () => {},
            }}
          />
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName={'send'}
            onPress={handleSend}
            iconStyle={{
              backgroundColor: COLORS.SECONDARY,
              color: COLORS.WHITE,
              marginBottom: 15,
              padding: 10,
              fontSize: FontSize.ExtraLarge,
              overflow: 'hidden',
              borderRadius: 10,
              transform: [{ scaleX: isLangRTL ? -1 : 1 }],
            }}
          />
        </RowComponent>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    marginVertical: 5,
    marginHorizontal: 15,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    maxWidth: screenWidth(78),
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginTop: 10,
    marginRight: 10,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.PRIMARY,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.SEARCH_BAR,
  },
  messageText: {
    color: COLORS.BLACK,
  },
  userMessageText: {
    color: COLORS.WHITE,
  },
  otherMessageText: {
    color: COLORS.BLACK,
  },
  timestamp: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.BORDER,
    textAlign: 'right',
    marginTop: 5,
  },
  inputContainer: {
    gap: 10,
    marginBottom: 20,
    paddingTop: 10,
    ...FLEX_CENTER,
  },
  itemText: {
    textAlign: 'center',
    lineHeight: 25,
  },
  messageContent: {
    maxWidth: screenWidth(100),
  },
  sectionHeaderContainer: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: 10,
  },
  sectionHeader: {
    fontWeight: FontWeight.SemiBold,
    textAlign: 'center',
    color: COLORS.BLACK,
  },
});
