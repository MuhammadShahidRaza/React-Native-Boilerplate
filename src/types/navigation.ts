import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'navigation/Navigators';

// Generic types that work for any screen
export type AppRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
export type AppNavigationProp<T extends keyof RootStackParamList> = NativeStackNavigationProp<
  RootStackParamList,
  T
>;

// Generic screen props type
export type AppScreenProps<T extends keyof RootStackParamList> = {
  route: AppRouteProp<T>;
  navigation: AppNavigationProp<T>;
};

// Utility type to get route params
export type RouteParams<T extends keyof RootStackParamList> = RootStackParamList[T];
