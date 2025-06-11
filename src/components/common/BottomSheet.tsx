import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextStyle, TouchableHighlight, ViewStyle, TouchableWithoutFeedback, Modal } from 'react-native';
import { CommonProps, FontSize, StyleType } from 'types/index';
import { Typography } from './Typography';
import { COLORS, isIOS, screenHeight, screenWidth } from 'utils/index';
import { FlatListComponent } from './Flatlist';
import { Photo } from './Photo';
import { RowComponent } from './Row';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT, SCREEN } from 'constants/screens';

import RBSheet from 'react-native-raw-bottom-sheet';



interface BottomSheetProps extends CommonProps {
  onClose?: () => void;
  height?: number;
  containerStyles?: ViewStyle;
  ref: any
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  onClose,
  height,
  containerStyles,
  children,
  ref
}) => {


  return (

    <RBSheet
      height={height}
      ref={ref}
      useNativeDriver={true}
      customStyles={{
        wrapper: {
          backgroundColor: 'transparent',
        },
        draggableIcon: {
          backgroundColor: '#000',
        },
      }}
      customModalProps={{
        animationType: 'slide',
        statusBarTranslucent: true,
      }}
      customAvoidingViewProps={{
        enabled: false,
      }}>
      <View style={[styles.container, containerStyles]}>
        {children}
      </View>
    </RBSheet>

  )


  return (
    <TouchableWithoutFeedback onPress={onClose} style={styles.shadowContainer}>
      <View style={[styles.container, { height: height }, containerStyles]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    width: SCREEN.width,
    height: SCREEN.height,
    zIndex: 5000,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
  },
  container: {
    width: SCREEN.width,
    zIndex: 250000,
    backgroundColor: COLORS.WHITE,
    position: 'absolute',
    bottom: 0
  },

});
