import { StyleSheet, View, Pressable, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize } from 'types/fontTypes';
import { COLORS, APP_GRADIENT_PRIMARY, APP_GRADIENT_PRIMARY_LIGHT } from 'utils/index';
import { useState } from 'react';

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

export const BookRideScreen = () => {
  const [where, setWhere] = useState('');

  return (
    <Wrapper
      headerTitle="Book a Ride"
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView={false}
      darkMode={false}
    >
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Where to?"
          placeholderTextColor={COLORS.APP_TEXT_MUTED}
          value={where}
          onChangeText={setWhere}
        />
        <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} style={styles.searchGo}>
          <Icon
            componentName={VARIABLES.Feather}
            iconName="arrow-right"
            size={FontSize.Medium}
            color={COLORS.WHITE}
          />
        </LinearGradient>
      </View>

      <View style={styles.map}>
        <View style={[styles.car, { top: 48, left: 40 }]} />
        <View style={[styles.car, { top: 120, left: 180 }]} />
        <View style={[styles.car, { top: 200, left: 60 }]} />
        <View style={[styles.car, { top: 160, right: 50 }]} />
        <LinearGradient colors={[...APP_GRADIENT_PRIMARY_LIGHT]} style={styles.pin}>
          <View style={styles.pinInner} />
        </LinearGradient>
        <Pressable style={styles.locate}>
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName="crosshairs-gps"
            size={22}
            color={COLORS.APP_TEXT}
          />
        </Pressable>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  search: {
    flex: 1,
    fontSize: FontSize.Medium,
    color: COLORS.APP_TEXT,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    paddingLeft: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  searchGo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  map: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    backgroundColor: COLORS.APP_MAP_BG,
    overflow: 'hidden',
  },
  car: {
    position: 'absolute',
    width: 22,
    height: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
  },
  pin: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.WHITE,
  },
  locate: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});
