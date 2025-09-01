import { string, StringSchema, object, ref, ObjectShape } from 'yup';
import { VALIDATION_MESSAGES } from 'constants/validationMessages';
import { REGEX } from '../regex';
import { COMMON_TEXT } from 'constants/screens';
import i18n from 'i18n/index';
import { LANGUAGES } from 'constants/common';

type StringValidationOptions = {
  regex?: RegExp;
  regexMessage?: string;
  minLengthMessage?: string;
  maxLengthMessage?: string;
  isRequired?: boolean;
  nullable?: boolean;
  name?: string;
  minLength?: number;
  maxLength?: number;
};

type Values = {
  [key: string]: string | number;
};

const arabicNumeralsMap: { [key: string]: string } = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

export const convertToArabicNumerals = (str: string): string => {
  return str.replace(/\d/g, digit => arabicNumeralsMap[digit]);
};

const getValidationMessageWithTranslation = (key: string, values: Values): string => {
  let messageTemplate = i18n.t(key);

  const messageWithValues = Object.keys(values).reduce(
    (message, placeholder) =>
      message.replace(
        new RegExp(`\\$\\{${placeholder}\\}`, 'g'),
        i18n.t(values[placeholder].toString()),
      ),
    messageTemplate,
  );
  if (i18n.language == LANGUAGES.ARABIC) {
    return convertToArabicNumerals(messageWithValues);
  } else {
    return messageWithValues;
  }
};

const createObjectShape = <T extends ObjectShape>(fields: T) => {
  return object(fields);
};

// const createStringValidationSchema = ({
//   regex,
//   regexMessage,
//   isRequired = true,
//   name,
//   nullable = false,
//   minLength,
//   maxLength,
// }: StringValidationOptions): StringSchema<string | null | undefined> => {
//   let schema: StringSchema<string | null | undefined> = string().transform((_, originalValue) =>
//     typeof originalValue === 'string' ? originalValue.trim() : originalValue,
//   );

//   if (isRequired && name && !nullable) {
//     schema = schema.required(() =>
//       getValidationMessageWithTranslation(VALIDATION_MESSAGES.IS_REQUIRED, {
//         name,
//       }),
//     );
//   }

//   if (regex && regexMessage) {
//     schema = schema.matches(regex, () => getValidationMessageWithTranslation(regexMessage, {}));
//   }

//   if (minLength !== undefined) {
//     schema = schema.min(minLength, () =>
//       getValidationMessageWithTranslation(VALIDATION_MESSAGES.MIN_LENGTH, {
//         minLength,
//       }),
//     );
//   }

//   if (maxLength !== undefined) {
//     schema = schema.max(maxLength, () =>
//       getValidationMessageWithTranslation(VALIDATION_MESSAGES.MAX_LENGTH, {
//         maxLength,
//       }),
//     );
//   }

//   if (nullable) {
//     schema = schema.nullable();
//   }
//   return schema;
// };

// Common schemas

function createStringValidationSchema<TNullable extends boolean = false>({
  regex,
  regexMessage,
  isRequired = true,
  name,
  nullable = false as TNullable,
  minLength,
  minLengthMessage,
  maxLength,
  maxLengthMessage,
}: StringValidationOptions & { nullable?: TNullable }): TNullable extends true
  ? StringSchema<string | null>
  : StringSchema<string> {
  let schema = string().transform((_, originalValue) =>
    typeof originalValue === 'string' ? originalValue.trim() : originalValue,
  ) as any;

  if (isRequired && name && !nullable) {
    schema = schema.required(() =>
      getValidationMessageWithTranslation(VALIDATION_MESSAGES.IS_REQUIRED, {
        name,
      }),
    );
  }

  if (regex && regexMessage) {
    schema = schema.matches(regex, () => getValidationMessageWithTranslation(regexMessage, {}));
  }

  if (minLength !== undefined) {
    schema = schema.min(
      minLength,
      minLengthMessage
        ? minLengthMessage
        : () =>
            getValidationMessageWithTranslation(VALIDATION_MESSAGES.MIN_LENGTH, {
              minLength,
            }),
    );
  }

  if (maxLength !== undefined) {
    schema = schema.max(
      maxLength,
      maxLengthMessage
        ? minLengthMessage
        : () =>
            getValidationMessageWithTranslation(VALIDATION_MESSAGES.MAX_LENGTH, {
              maxLength,
            }),
    );
  }

  if (nullable) {
    schema = schema.nullable();
  }

  return schema;
}

const emailSchema = createStringValidationSchema({
  regex: REGEX.EMAIL,
  regexMessage: VALIDATION_MESSAGES.INVALID_EMAIL_FORMAT,
  name: COMMON_TEXT.EMAIL,
});

const passwordValidation = {
  regex: REGEX.PASSWORD,
  regexMessage: VALIDATION_MESSAGES.PASSWORD_MUST_CONTAIN,
  minLength: 8,
};

const passwordSchema = createStringValidationSchema({
  name: COMMON_TEXT.PASSWORD,
  ...passwordValidation,
});

const confirmPasswordSchema = ({ name = 'new_password' }) => {
  return string()
    .oneOf([ref(name)], VALIDATION_MESSAGES.PASSWORDS_MUST_MATCH)
    .transform((_, originalValue) =>
      typeof originalValue === 'string' ? originalValue.trim() : originalValue,
    )
    .required(() =>
      getValidationMessageWithTranslation(VALIDATION_MESSAGES.IS_REQUIRED, {
        name: COMMON_TEXT.CONFIRM_PASSWORD,
      }),
    );
};

const newPasswordSchema = createStringValidationSchema({
  name: COMMON_TEXT.NEW_PASSWORD,
  ...passwordValidation,
});
const currentPasswordSchema = createStringValidationSchema({
  name: COMMON_TEXT.CURRENT_PASSWORD,
  ...passwordValidation,
});
const phoneNumberSchema = createStringValidationSchema({
  name: COMMON_TEXT.PHONE_NUMBER,
  minLengthMessage: VALIDATION_MESSAGES.WRONG_PHONE_NUMBER,
  maxLengthMessage: VALIDATION_MESSAGES.WRONG_PHONE_NUMBER,
  minLength: 7,
  maxLength: 17,
});

const userNameSchema = createStringValidationSchema({
  regex: REGEX.USERNAME,
  regexMessage: VALIDATION_MESSAGES.INVALID_USERNAME,
  name: COMMON_TEXT.USERNAME,
  minLength: 3,
  maxLength: 20,
});

const verificationCodeSchema = createStringValidationSchema({
  regex: REGEX.VERIFICATION,
  name: COMMON_TEXT.VERIFICATION_CODE,
  regexMessage: VALIDATION_MESSAGES.INVALID_VERIFICATION_CODE,
  minLength: 6,
  maxLength: 6,
});

// const linkSchema = createStringValidationSchema({
//   regex: REGEX.URL,
//   regexMessage: VALIDATION_MESSAGES.INVALID_URL_FORMAT,
//   nullable: true,
// });

// Validation schemas
export const loginValidationSchema = createObjectShape({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpValidationSchema = createObjectShape({
  email: emailSchema,
  password: passwordSchema,
  full_name: createStringValidationSchema({
    name: COMMON_TEXT.FULL_NAME,
    regex: REGEX.FIRST_NAME,
    regexMessage: getValidationMessageWithTranslation(
      VALIDATION_MESSAGES.INVALID_NAME_WITH_HYPHEN,
      {
        name: COMMON_TEXT.FULL_NAME,
      },
    ),
    minLength: 3,
    maxLength: 25,
  }),
  user_name: userNameSchema,
  country: createStringValidationSchema({
    name: COMMON_TEXT.COUNTRY,
    regex: REGEX.FIRST_NAME,
    regexMessage: getValidationMessageWithTranslation(
      VALIDATION_MESSAGES.INVALID_NAME_WITH_HYPHEN,
      {
        name: COMMON_TEXT.COUNTRY,
      },
    ),
    minLength: 3,
    maxLength: 25,
  }),
  phone_number: phoneNumberSchema,
  confirmPassword: confirmPasswordSchema({ name: 'password' }),
});

export const becomePractitionerFormValidationSchema = createObjectShape({
  email: emailSchema,
  name: createStringValidationSchema({
    name: COMMON_TEXT.NAME,
    regex: REGEX.FIRST_NAME,
    regexMessage: getValidationMessageWithTranslation(
      VALIDATION_MESSAGES.INVALID_NAME_WITH_HYPHEN,
      {
        name: COMMON_TEXT.NAME,
      },
    ),
    minLength: 3,
    maxLength: 25,
  }),
  phoneNumber: phoneNumberSchema,
});

export const verificationValidationSchema = createObjectShape({
  code: verificationCodeSchema,
});
export const forgotPasswordValidationSchema = createObjectShape({
  email: emailSchema,
});

export const resetPasswordValidationSchema = createObjectShape({
  new_password: newPasswordSchema,
  confirm_password: confirmPasswordSchema({
    name: 'new_password',
  }),
});

export const changePasswordValidationSchema = createObjectShape({
  current_password: currentPasswordSchema,
  new_password: newPasswordSchema,
  confirm_password: confirmPasswordSchema({
    name: 'new_password',
  }),
});

export const cardValidationSchema = createObjectShape({
  name: createStringValidationSchema({
    name: COMMON_TEXT.NAME,
    regex: REGEX.FIRST_NAME,
    regexMessage: getValidationMessageWithTranslation(
      VALIDATION_MESSAGES.INVALID_NAME_WITH_HYPHEN,
      {
        name: COMMON_TEXT.NAME,
      },
    ),
    minLength: 3,
    maxLength: 25,
  }),
  cardNumber: createStringValidationSchema({
    name: COMMON_TEXT.CARD_NUMBER,
    regex: REGEX.CARD_NUMBER,
    regexMessage: VALIDATION_MESSAGES.INVALID_CREDIT_CARD,
  }),
  cvv: createStringValidationSchema({
    name: COMMON_TEXT.CVV,
    regex: REGEX.CVV,
    regexMessage: VALIDATION_MESSAGES.INVALID_CVV,
  }),
  expiryDate: createStringValidationSchema({
    name: COMMON_TEXT.EXPIRY_DATE,
    regex: REGEX.EXPIRY_DATE,
    regexMessage: VALIDATION_MESSAGES.INVALID_EXPIRY_DATE,
  }),
});

export const contactUsValidationSchema = createObjectShape({
  email: emailSchema,
  subject: createStringValidationSchema({
    name: 'Subject',
    minLength: 5,
    maxLength: 50,
  }),
  message: createStringValidationSchema({
    name: COMMON_TEXT.MESSAGE,
    minLength: 50,
    maxLength: 500,
  }),
});

export const editProfileValidationSchema = createObjectShape({
  full_name: createStringValidationSchema({
    name: COMMON_TEXT.FULL_NAME,
    regex: REGEX.FIRST_NAME,
    regexMessage: getValidationMessageWithTranslation(
      VALIDATION_MESSAGES.INVALID_NAME_WITH_HYPHEN,
      {
        name: COMMON_TEXT.FULL_NAME,
      },
    ),
    minLength: 3,
    maxLength: 25,
  }),
  user_name: userNameSchema,
  country: createStringValidationSchema({
    name: COMMON_TEXT.COUNTRY,
    regex: REGEX.FIRST_NAME,
    regexMessage: getValidationMessageWithTranslation(
      VALIDATION_MESSAGES.INVALID_NAME_WITH_HYPHEN,
      {
        name: COMMON_TEXT.COUNTRY,
      },
    ),
    minLength: 3,
    maxLength: 25,
  }),
  phone_number: phoneNumberSchema,
  email: emailSchema,
});

// Utility functions
export const formatCardNumber = (value: string): string => {
  return value
    .replace(/\s/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
};

export const formatExpiryDate = (value: string): string => {
  const cleanedValue = value.replace(/\D/g, '');
  return cleanedValue.replace(/(.{2})/, '$1/').trim();
};
