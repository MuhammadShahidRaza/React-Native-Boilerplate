import { changePasswordValidationSchema, editProfileValidationSchema } from 'utils/index';
import { InferType } from 'yup';

export type EditProfileFormTypes = InferType<typeof editProfileValidationSchema>;
export type ChangePasswordFormTypes = Omit<
  InferType<typeof changePasswordValidationSchema>,
  'confirm_password'
>;
