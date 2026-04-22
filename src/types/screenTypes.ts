import { editProfileValidationSchema } from 'utils/index';
import { InferType } from 'yup';

export type EditProfileFormTypes = InferType<typeof editProfileValidationSchema> & {
  profile_image?: any;
  is_freezed?: number;
  is_notify?: number;
};
export type ChangePasswordFormTypes = {
  current_password: string;
  password: string;
  password_confirmation: string;
};
