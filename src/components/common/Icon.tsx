import { GestureResponderEvent, StyleProp, TextStyle } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FontSize } from 'types/fontTypes';
// import {useTranslation} from 'hooks/useTranslation';

// Define Props type
export type IconComponentProps = {
  componentName: keyof typeof IconComponentMapping; // keyof typeof to ensure componentName is one of the keys in IconComponentMapping
  iconName: string;
  size?: number;
  color?: string;
  onPress?: (event: GestureResponderEvent) => void;
  iconStyle?: StyleProp<TextStyle>;
};

// Map icon component based on componentName
export const IconComponentMapping = {
  FontAwesome: FontAwesome,
  Entypo: Entypo,
  Feather: Feather,
  EvilIcons: EvilIcons,
  AntDesign: AntDesign,
  FontAwesome5: FontAwesome5,
  Ionicons: Ionicons,
  MaterialCommunityIcons: MaterialCommunityIcons,
  MaterialIcons: MaterialIcons,
} as const;

// Icon component
export const Icon = ({
  componentName,
  iconName,
  size = FontSize.Medium,
  color = 'black',
  onPress,
  iconStyle,
}: IconComponentProps) => {
  // const {isLangRTL} = useTranslation();
  const IconComponent = IconComponentMapping[componentName];

  if (!IconComponent) {
    console.warn(`Icon component ${componentName} not found.`);
    return null;
  }

  return (
    <IconComponent
      name={iconName}
      size={size}
      color={color}
      suppressHighlighting={true}
      onPress={onPress}
      style={[iconStyle]}
    />
  );
};

// {transform: [{scaleX: isLangRTL ? -1 : 1}]}
