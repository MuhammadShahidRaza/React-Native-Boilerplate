import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { Typography, RowComponent, Wrapper } from 'components/common';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes/index';
import { Button } from 'components/common/Button';
import { AUTH_TEXT, COMMON_TEXT } from 'constants/screens/index';
import { AuthComponent } from 'components/appComponents';

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
    navigate(SCREENS.RESET_PASSWORD);
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
    <AuthComponent
          heading1={'Enter OTP'}
          description={'Enter the verification code we just sent to  tomcook@example.com.'}
          bottomText={''}
          bottomButtonText={''}
          containerStyle={{ marginTop: 0 }} 
          descriptionStyle={styles.descriptionStyles}
          
        >
       <View style={styles.outer}>
      <View style={styles.container}>
      
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

      
        {/* <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          disabled={code.length !== CODE_LENGTH}
        >
          <Typography style={styles.verifyButtonText}>Verify</Typography>
        </TouchableOpacity> */}
        <Button title={COMMON_TEXT.VERIFY} onPress={()=>{handleVerify()}} style={styles.button} />
            <RowComponent
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop:13
          }}
        >
          <Typography style={styles.timer}>00</Typography>
          <Text style={styles.timer}>:</Text>
          <Typography style={styles.timer}>{`${timer.toString().padStart(2, '0')}`}</Typography>
        </RowComponent>
        
      </View>
      <RowComponent style={styles.resendContainer}>
      <Typography style={styles.infoText}>Didn't you receive any code?</Typography>
      <TouchableOpacity onPress={handleResend} disabled={!isResendEnabled}>
        <Typography style={[styles.resendText, !isResendEnabled && styles.resendDisabled]}>
          Send Again
        </Typography>
      </TouchableOpacity>
    </RowComponent>
      </View>
    </AuthComponent>
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
  outer: {
  flex: 1,
  justifyContent: 'space-between',
},

resendContainer: {
  justifyContent: 'center',
  alignItems: 'center',
  height:'150%',
  flexDirection: 'row',

},

    button: {
    marginTop:12,
    alignSelf:"center"
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
    justifyContent:'space-evenly'
  },
  codeInput: {
    width: 50,
    height: 56,
    borderBottomWidth : 2,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: COLORS.WHITE,
  },
  codeInputFilled: {
    borderColor: COLORS.PRIMARY,
  },
  codeInputActive: {
    borderColor: COLORS.PRIMARY,
    borderBottomWidth: 2,
  },
  codeText: {
    fontSize: FontSize.XXL+4,
    color: COLORS.BLACK,
    fontWeight: FontWeight.Bold,
  },
  timer: {
    fontSize: FontSize.Medium,
    color: COLORS.OTP_TIMER,
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
    color: COLORS.BLACK,
    textAlign: 'center',
    fontSize: FontSize.Medium,
    fontWeight:'bold',
    marginEnd:8
  },
  resendText: {
    color: COLORS.PRIMARY,
    textAlign: 'center',  
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
  resendDisabled: {
    color: COLORS.PRIMARY,
  },
  descriptionStyles:{fontSize:FontSize.MediumSmall,color:COLORS.ICONS}
});
