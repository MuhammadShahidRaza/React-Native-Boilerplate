import { View, StyleSheet, StyleProp, TextStyle, Touchable, TouchableOpacity, ViewStyle, SafeAreaView } from 'react-native';
import { RowComponent } from './Row';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight, ChildrenType } from 'types/index';
import { Typography } from './Typography';
import { onBack } from 'navigation/index';
import { Photo } from './Photo';
import { COLORS } from 'utils/colors';
import { useTranslation } from 'hooks/useTranslation';
import { useState } from 'react';


type Props = {
  title?: string;
  location?: string;
  onLocationPress: () => void;
  onBellPress: () => void;
  isListView: boolean;
  setIsListView: () => void;
};


type RadioProps = {
  checked: boolean;
  onPress: () => void;
  style?: ViewStyle
};


const Radio = ({ checked, onPress, style }: RadioProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[radioStyles.container, style, { justifyContent: checked ? 'flex-end' : 'flex-start' }]}>
      <View style={radioStyles.circle} />
    </TouchableOpacity>
  )
}



const radioStyles = StyleSheet.create({
  container: {
    padding: 3,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.GREEN,
    borderRadius: 10,
    width: 30
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: COLORS.PURPLE,
  }

});


export const HomeHeader = ({
  title = '',
  location = '',
  onLocationPress,
  onBellPress,
  isListView,
  setIsListView

}: Props) => {
  const { isLangRTL } = useTranslation();

  return (
    <SafeAreaView style={{ zIndex: 2000 }}>
      <RowComponent style={styles.headerContainer}>
        <View>
          <Typography style={styles.title}>{title}</Typography>
          <TouchableOpacity onPress={onLocationPress}>
            <RowComponent>
              <Icon
                componentName={VARIABLES.Ionicons}
                iconName={'location-outline'}
                size={15}
                onPress={() => { }}
                iconStyle={{
                  marginEnd: 10,
                  marginVertical: 10,
                  color: COLORS.GREEN,
                }}
              />
              <Typography style={styles.location}>{location}</Typography>
            </RowComponent>
          </TouchableOpacity>
        </View>
        <RowComponent style={styles.leftIconsContainer}>
          <Typography style={styles.listViewText}>List View</Typography>
          <Radio onPress={setIsListView} checked={isListView} />
        </RowComponent>
        <TouchableOpacity onPress={onBellPress}>
          <Icon
            componentName={VARIABLES.Feather}
            iconName={'bell'}
            size={20}
            onPress={() => { }}
            iconStyle={{
              marginEnd: 10,
              color: COLORS.GREEN,
            }}
          />
        </TouchableOpacity>
      </RowComponent>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 20,
    paddingTop: 15,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    marginBottom: 8
  },
  location: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
  },

  leftIconsContainer: {

  },
  listViewText: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    marginEnd: 8
  },

});
