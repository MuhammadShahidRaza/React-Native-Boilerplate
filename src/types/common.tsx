import {TFunction} from 'i18next';
import {Dispatch, FC, ReactNode, SetStateAction} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';

export type ChildrenType = ReactNode;
export type TranslationType = TFunction;
export type SvgNameType = FC<SvgProps>;
export type StyleType = StyleProp<ViewStyle>;
export type SetStateType<T> = Dispatch<SetStateAction<T>>;
export type voidFuntionType = () => void;

export type CommonProps = {
  children: ChildrenType;
  style?: StyleType;
};

export enum PROVIDERS {
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
}

export type StackParamList = {
  Appointments: {
    tab: string;
  };
  Courses: {
    tab: string;
  };
  AddReview: {
    isNotEditable: boolean;
  };
};
