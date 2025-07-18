import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { Typography, RowComponent, Wrapper, Button } from 'components/common';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COMMON_TEXT } from 'constants/screens';
import { useRoute } from '@react-navigation/native';
import { navigate } from 'navigation/Navigators';
import { AppRouteProp } from 'types/navigation';
import { SCREENS } from 'constants/routes';
import { resendEmailCode, verifyEmailCode } from 'api/functions/auth';

const CODE_LENGTH = 4;
const TIMER_SECONDS = 59;

export const Verification = () => {
  const route = useRoute<AppRouteProp<typeof SCREENS.VERIFICATION>>();
  const isFromForgot = route.params?.isFromForgot;
  const email = route.params?.email;
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const inputRef = useRef<TextInput>(null);

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

  const handleVerify = () => {
    if (isFromForgot) {
      navigate(SCREENS.RESET_PASSWORD);
      return;
    }
    verifyEmailCode({ data: { token: code } });
  };

  const handleResend = () => {
    if (isResendEnabled) {
      setTimer(TIMER_SECONDS);
      setIsResendEnabled(false);
      setCode('');
      inputRef.current?.focus();
      resendEmailCode({data:{email}})
    }
  };

  // Create array for visual display
  const displayCode = Array(CODE_LENGTH)
    .fill('')
    .map((_, idx) => code[idx] || '');

  return (
    <Wrapper useScrollView>
      <View style={styles.container}>
        <Typography style={styles.title}>
          {isFromForgot ? COMMON_TEXT.VERIFICATION_CODE : COMMON_TEXT.ENTER_4_DIGIT}
        </Typography>
        {!isFromForgot && (
          <Typography style={[styles.title, { textTransform: 'lowercase' }]}>
            {COMMON_TEXT.RECOVERY_CODE}
          </Typography>
        )}
        <Typography style={styles.subtitle}>{COMMON_TEXT.ENTER_VERIFICATION_CODE_YOU}</Typography>
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
          <Text style={styles.timer}>:</Text>
          <Typography style={styles.timer}>{`${timer.toString().padStart(2, '0')}`}</Typography>
        </RowComponent>
        <Button
          style={styles.verifyButton}
          onPress={handleVerify}
          title={COMMON_TEXT.VERIFY}
          disabled={code.length !== CODE_LENGTH}
        />
        <Typography style={styles.infoText}>{COMMON_TEXT.DID_NOT_YOU_RECIEVE}</Typography>
        <TouchableOpacity onPress={handleResend} disabled={!isResendEnabled}>
          <Typography style={[styles.resendText, !isResendEnabled && styles.resendDisabled]}>
            {COMMON_TEXT.RE_SEND_CODE}
          </Typography>
        </TouchableOpacity>
      </View>
    </Wrapper>
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
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  codeInputFilled: {
    borderColor: COLORS.PRIMARY,
  },
  codeInputActive: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
  },
  codeText: {
    fontSize: FontSize.Large,
    color: COLORS.PRIMARY,
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
    color: COLORS.SECONDARY,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
  resendDisabled: {
    color: COLORS.BORDER,
  },
});
