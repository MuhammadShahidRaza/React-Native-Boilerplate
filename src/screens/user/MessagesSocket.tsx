import { Header, Icon, Input, RowComponent, Typography, Wrapper } from 'components/common';
import { SOCKET_EVENTS, VARIABLES } from 'constants/common';
import { COMMON_TEXT, TEMPORARY_TEXT } from 'constants/screens';
import { useState, useRef, useEffect } from 'react';
import { View, SectionList, StyleSheet, Alert } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { isIOS, screenWidth, formatDateMonthDayYear } from 'utils/helpers';
import { FLEX_CENTER } from '../../utils/commonStyles/index';
import { IMAGES } from 'constants/assets';
import { useTranslation } from 'hooks/useTranslation';
import useSocketFunctions from 'hooks/useSocket';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/routes';

interface SocketMessage {
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
const groupMessagesByDate = (messages: SocketMessage[]) => {
  const sections = messages.reduce(
    (acc, message) => {
      const date = message.createdAt.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    },
    {} as Record<string, SocketMessage[]>,
  );

  return Object.keys(sections).map(date => ({
    data: sections[date],
    title: date,
  }));
};

export const MessagesSocket = ({ route }: AppScreenProps<typeof SCREENS.MESSAGES_SOCKET>) => {
  const { isLangRTL } = useTranslation();
  const conversationId = route.params?.data?.conversationId;
  const otherUser = route.params?.data?.otherUser;
  const chatTitle = otherUser?.full_name?.trim() || TEMPORARY_TEXT.JOHN_DOE;
  const { on, off, emit } = useSocketFunctions();

  useEffect(() => {
    const handleMessage = (payload: {
      conversationId: string;
      message: { id: string; text: string; senderId: string; createdAt: string };
    }) => {
      if (payload.conversationId !== conversationId) return;
      const msg = payload.message;
      setMessages(prev => [
        ...prev,
        {
          id: msg.id,
          text: msg.text,
          sender: 'other',
          createdAt: new Date(msg.createdAt),
        },
      ]);
    };
    on(SOCKET_EVENTS.MESSAGE, handleMessage);
    return () => off(SOCKET_EVENTS.MESSAGE);
  }, [conversationId, on, off]);

  const tempList: SocketMessage[] = [
    {
      id: '1',
      text: 'Hello John Doe, How can I help you?',
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

  const [messages, setMessages] = useState<SocketMessage[]>(tempList);
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState<string>('');
  const sectionListRef = useRef<SectionList>(null);
  const groupedMessages = groupMessagesByDate(messages);

  // Validation functions
  const containsEmail = (text: string): boolean => {
    // Email regex pattern
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return emailRegex.test(text);
  };

  const containsPhoneNumber = (text: string): boolean => {
    // Comprehensive phone number detection
    // Remove all separators (spaces, dots, dashes, parentheses) except + at the start
    // This normalizes formats like "+92 324 244. 56. 23" to "+923242445623"
    const normalizedText = text.replace(/[\s.\-()]/g, '');

    // Check for sequences of 7+ consecutive digits (minimum phone number length)
    // This catches formats like: +92 324 244. 56. 23, 123-456-7890, (123) 456-7890, etc.
    const phoneRegex = /\+?\d{7,}/;

    if (phoneRegex.test(normalizedText)) {
      // Additional validation: check if the pattern in original text looks like a phone number
      // This helps avoid false positives on long numbers in other contexts
      const phonePatterns = [
        // International format with flexible separators: +92 324 244. 56. 23, +1 234 567 8900
        // Allows spaces, dots, dashes between digit groups
        /\+\d{1,4}[\s.\-]*\d{1,4}[\s.\-]*\d{1,4}[\s.\-]*\d{1,4}/,
        // Standard US/International: (123) 456-7890, 123-456-7890, 123.456.7890
        /\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}/,
        // Formats with mixed separators and spaces: 324 244. 56. 23, 123 456.7890
        // Matches 2-4 digits, optional separator, 2-4 digits, etc.
        /\d{2,4}[\s.\-]*\d{2,4}[\s.\-]*\d{2,4}[\s.\-]*\d{2,4}/,
        // Long digit sequences (10+ digits) that might be phone numbers
        /\d{10,}/,
      ];

      // Check if any pattern matches in the original text
      return phonePatterns.some(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          // Extract digits from the match to verify it's substantial (7+ digits)
          const digitsOnly = matches[0].replace(/\D/g, '');
          return digitsOnly.length >= 7;
        }
        return false;
      });
    }

    return false;
  };

  const containsLink = (text: string): boolean => {
    // Comprehensive URL/link detection
    // Matches various URL patterns:
    // - http://, https://
    // - www.
    // - domain.com, domain.org, etc.
    // - IP addresses
    // - URLs with paths, queries, fragments

    const urlPatterns = [
      // Protocol-based URLs: http://, https://, ftp://, etc.
      /https?:\/\/[^\s]+/gi,
      // www. URLs: www.example.com
      /www\.[^\s]+\.[a-zA-Z]{2,}/gi,
      // Domain patterns: example.com, example.org, subdomain.example.com
      /[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/gi,
      // IP addresses: 192.168.1.1, 10.0.0.1
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/gi,
      // Shortened URLs: bit.ly, tinyurl.com, etc.
      /(bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|shortlink|shortener)[^\s]*/gi,
    ];

    // Check if any URL pattern matches
    return urlPatterns.some(pattern => pattern.test(text));
  };

  const validateMessage = (text: string): { isValid: boolean; error: string } => {
    if (containsEmail(text)) {
      return { isValid: false, error: 'Email addresses are not allowed in messages' };
    }
    if (containsPhoneNumber(text)) {
      return { isValid: false, error: 'Phone numbers are not allowed in messages' };
    }
    if (containsLink(text)) {
      return { isValid: false, error: 'Links and URLs are not allowed in messages' };
    }
    return { isValid: true, error: '' };
  };

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (trimmedText.length === 0) {
      return;
    }

    // Validate message
    const validation = validateMessage(trimmedText);

    if (!validation.isValid) {
      setValidationError(validation.error);
      Alert.alert('Invalid Message', validation.error);
      return;
    }

    // Clear any previous errors
    setValidationError('');

    const newMessage: SocketMessage = {
      id: (messages.length + 1).toString(),
      text: trimmedText,
      sender: 'user',
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    emit(SOCKET_EVENTS.MESSAGE, {
      conversationId,
      text: trimmedText,
      message: {
        id: newMessage.id,
        text: trimmedText,
        createdAt: newMessage.createdAt.toISOString(),
      },
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && groupedMessages.length > 0) {
      setTimeout(() => {
        const lastSectionIndex = groupedMessages.length - 1;
        const lastItemIndex = groupedMessages[lastSectionIndex].data.length - 1;
        sectionListRef.current?.scrollToLocation({
          sectionIndex: lastSectionIndex,
          itemIndex: lastItemIndex,
          animated: true,
        });
      }, 100);
    }
  }, [messages.length, groupedMessages.length]);

  const renderMessage = ({ item }: { item: SocketMessage }) => {
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
            <Typography translate={false} style={styles.timestamp}>
              {timeString}
            </Typography>
          </View>
        </View>
      </RowComponent>
    );
  };

  return (
    <>
      <Wrapper showBackButton={false}>
        <Header
          headerContainerStyle={{
            gap: 15,
          }}
          titleContainerStyle={{
            justifyContent: 'flex-start',
          }}
          titleStyle={{ fontSize: FontSize.Medium }}
          subtitle='online'
          subtitleContainerStyle={{
            alignItems: 'flex-start',
          }}
          subtitleTextStyle={{
            color: COLORS.GREEN,
          }}
          title={chatTitle}
          centerImage={IMAGES.USER_IMAGE}
          showBackButton={true}
          centerImageStyle={{
            backgroundColor: COLORS.WHITE,
          }}
        />
        <SectionList
          ref={sectionListRef}
          sections={groupedMessages}
          renderItem={renderMessage}
          renderSectionHeader={({ section }) => {
            const formattedDate = formatDateMonthDayYear(section.title);
            return (
              <View style={styles.sectionHeaderContainer}>
                <Typography translate={false} style={styles.sectionHeader}>
                  {formattedDate}
                </Typography>
              </View>
            );
          }}
          keyExtractor={item => item.id}
        />
        {/* <View>
          <FlatListComponent
            horizontal
            style={{ marginLeft: 15 }}
            data={[]}
            renderItem={() => null}
          />
        </View> */}
        <RowComponent style={styles.inputContainer}>
          <Input
            name={COMMON_TEXT.EMAIL}
            onChangeText={text => {
              setInputText(text);
              // Clear error when user starts typing
              if (validationError) {
                setValidationError('');
              }
            }}
            containerStyle={{ width: screenWidth(78) }}
            value={inputText}
            placeholder={'Type Message...'}
            error={validationError}
            touched={!!validationError}
          />
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName={'send-outline'}
            onPress={handleSend}
            iconStyle={{
              backgroundColor: COLORS.PRIMARY,
              color: COLORS.WHITE,
              marginBottom: 12,
              padding: 13,
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
    color: COLORS.TEXT,
  },
  timestamp: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 5,
  },
  inputContainer: {
    gap: 10,
    paddingTop: 10,
    marginBottom: isIOS() ? 50 : 25,
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
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: 10,
  },
  sectionHeader: {
    fontWeight: FontWeight.SemiBold,
    textAlign: 'center',
    color: COLORS.TEXT,
  },
});
