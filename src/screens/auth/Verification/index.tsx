import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { Typography, RowComponent, Wrapper } from 'components/common';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';

const CODE_LENGTH = 4;
const TIMER_SECONDS = 59;

export const Verification = () => {
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
    }
  }, [timer]);

  const handleChange = (text: string) => {
    // Only allow numbers and limit to CODE_LENGTH
    const numbers = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(numbers);
  };

  const handleVerify = () => {
    // Add verification logic here
  };

  const handleResend = () => {
    if (isResendEnabled) {
      setTimer(TIMER_SECONDS);
      setIsResendEnabled(false);
      setCode('');
      inputRef.current?.focus();
      // Add resend logic here
    }
  };

  // Create array for visual display
  const displayCode = Array(CODE_LENGTH).fill('').map((_, idx) => code[idx] || '');

  return (
    <Wrapper>
      <View style={styles.container}>
        <Typography style={styles.title}>Enter 4-digit</Typography>
        <Typography style={styles.title}>recovery code</Typography>
        <Typography style={styles.subtitle}>
          Enter verification code you received on your email address
        </Typography>
        
        <View style={styles.codeContainer}>
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoFocus
            textContentType="oneTimeCode"
          />
          <RowComponent style={styles.codeRow}>
            {displayCode.map((digit, idx) => (
              <View
                key={idx}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                  idx === code.length && styles.codeInputActive,
                ]}
              >
                <Typography style={styles.codeText}>{digit}</Typography>
              </View>
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
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          disabled={code.length !== CODE_LENGTH}
        >
          <Typography style={styles.verifyButtonText}>Verify</Typography>
        </TouchableOpacity>
        <Typography style={styles.infoText}>Didn't you receive any code?</Typography>
        <TouchableOpacity onPress={handleResend} disabled={!isResendEnabled}>
          <Typography style={[styles.resendText, !isResendEnabled && styles.resendDisabled]}>
            Re-send code
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
    fontSize: FontSize.Large,
    marginBottom: 8,
    color: COLORS.PRIMARY,
    textAlign: 'left',
  },
  subtitle: {
    color: COLORS.BORDER,
    fontSize: FontSize.Small,
    marginBottom: 24,
    textAlign: 'left',
  },
  codeContainer: {
    position: 'relative',
    marginBottom: 24,
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
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
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
