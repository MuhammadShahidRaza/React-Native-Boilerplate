import { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Typography, RowComponent, Button } from 'components/common';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COMMON_TEXT } from 'constants/screens';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/routes';
import { resendEmailCode, verifyEmailCode, verifyOtpCode } from 'api/functions/auth';
import { AuthComponent } from 'components/appComponents';
import { useSelector } from 'react-redux';
import { RootState } from 'types/reduxTypes';
import { useMultipleAsyncButtons, useResetStackOnBack } from 'hooks/index';

const CODE_LENGTH = 4;
const TIMER_SECONDS = 59;

export const Verification = ({
  route,
  navigation,
}: AppScreenProps<typeof SCREENS.VERIFICATION>) => {
  const isFromForgot = route.params?.isFromForgot;
  const email = route.params?.email;
  const phone_number = route.params?.phone_number;
  const country_code = route.params?.country_code;
  const calling_code = route.params?.calling_code;
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const role = useSelector((state: RootState) => state.user.role);

  useResetStackOnBack(navigation, {
    index: 1,
    routes: [{ name: SCREENS.GET_STARTED }, { name: SCREENS.LOGIN }],
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendEnabled(true);
      return;
    }
  }, [timer]);

  const handleChange = (text: string) => {
    // Only allow numbers and limit to CODE_LENGTH
    const numbers = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(numbers);
  };

  // 🎯 Use multiple async buttons for verify and resend
  const buttons = useMultipleAsyncButtons();

  const handleVerify = buttons.wrap('verify', async () => {
    if (isFromForgot) {
      await verifyOtpCode({
        data: {
          email,
          phone_number,
          country_code,
          calling_code,
          otp_code: code,
        },
      });
    } else {
      await verifyEmailCode({
        data: {
          otp: code,
          user_type: role,
        },
      });
    }
  });

  const handleResend = buttons.wrap('resend', async () => {
    if (isResendEnabled) {
      setTimer(TIMER_SECONDS);
      setIsResendEnabled(false);
      setCode('');
      inputRef.current?.focus();
      if (email) {
        await resendEmailCode({ data: { email } });
      }
    }
  });

  // Create array for visual display
  const displayCode = Array(CODE_LENGTH)
    .fill('')
    .map((_, idx) => code[idx] || '');

  return (
    <AuthComponent
      heading1={COMMON_TEXT.VERIFICATION_CODE}
      description={COMMON_TEXT.ENTER_VERIFICATION_CODE_YOU}
      descriptionStyle={{ marginBottom: 20, textAlign: 'left' }}
      containerStyle={{ marginTop: 30 }}
      bottomButtonText=''
      bottomText=''
    >
      <View style={styles.codeContainer}>
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleChange}
          keyboardType='number-pad'
          maxLength={CODE_LENGTH}
          autoFocus
          textContentType='oneTimeCode'
        />
        <RowComponent style={styles.codeRow}>
          {displayCode.map((digit, idx) => (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                inputRef.current?.focus();
              }}
              key={idx}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                idx === code.length && styles.codeInputActive,
              ]}
            >
              <Typography style={styles.codeText}>{digit}</Typography>
            </TouchableOpacity>
          ))}
        </RowComponent>
      </View>
      <RowComponent
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography style={styles.timer}>00</Typography>
        <Typography style={[styles.timer]} translate={false}>
          :
        </Typography>
        <Typography style={styles.timer}>{`${timer.toString().padStart(2, '0')}`}</Typography>
      </RowComponent>
      <Button
        style={styles.verifyButton}
        onPress={handleVerify}
        title={COMMON_TEXT.VERIFY}
        loading={buttons.isLoading('verify')}
        disabled={code.length !== CODE_LENGTH || buttons.isLoading('verify')}
      />
      <Typography style={styles.infoText}>{COMMON_TEXT.DID_NOT_YOU_RECIEVE}</Typography>
      <TouchableOpacity
        onPress={handleResend}
        disabled={!isResendEnabled || buttons.isLoading('resend')}
      >
        <Typography
          style={[
            styles.resendText,
            (!isResendEnabled || buttons.isLoading('resend')) && styles.resendDisabled,
          ]}
        >
          {buttons.isLoading('resend') ? 'Sending...' : COMMON_TEXT.RE_SEND_CODE}
        </Typography>
      </TouchableOpacity>
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  title: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.ExtraLarge,
    color: COLORS.PRIMARY,
    textAlign: 'left',
  },
  subtitle: {
    color: COLORS.TEXT,
    fontSize: FontSize.MediumSmall,
    marginVertical: 20,
    textAlign: 'left',
  },
  codeContainer: {
    position: 'relative',
    marginVertical: 24,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: 56,
    opacity: 0,
    fontSize: FontSize.Large,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeInput: {
    width: 56,
    height: 56,
    borderBottomWidth: 4,
    // borderRadius: 10,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
  },
  codeInputFilled: {
    borderColor: COLORS.PRIMARY,
  },
  codeInputActive: {
    borderColor: COLORS.PRIMARY,
       borderBottomWidth: 4,
    // borderRadius: 10,
  },
  codeText: {
    fontSize: FontSize.Large,
    color: COLORS.TEXT,
    fontWeight: FontWeight.Bold,
  },
  timer: {
    fontSize: FontSize.Large,
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    marginBottom: 30,
  },
  infoText: {
    color: COLORS.BORDER,
    textAlign: 'center',
    marginBottom: 8,
  },
  resendText: {
    color: COLORS.TEXT,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
  resendDisabled: {
    color: COLORS.BORDER,
  },
});
