import { string, StringSchema, object, ref, ObjectShape, array, mixed } from 'yup';
import { VALIDATION_MESSAGES } from 'constants/validationMessages';
import { REGEX } from '../regex';
import { COMMON_TEXT } from 'constants/screens';
import i18n from 'i18n/index';
import { LANGUAGES } from 'constants/common';
import { isWorkerRole } from 'config/app';

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
        ? maxLengthMessage
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
  phone_number: phoneNumberSchema,
  password: passwordSchema,
});

export const signUpValidationSchema = createObjectShape({
  email: emailSchema,
  password: passwordSchema,
  full_name: createStringValidationSchema({
    name: COMMON_TEXT.NAME,
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
  // user_name: userNameSchema,
  // country: createStringValidationSchema({
  //   name: COMMON_TEXT.COUNTRY,
  //   regex: REGEX.FIRST_NAME,
  //   regexMessage: getValidationMessageWithTranslation(
  //     VALIDATION_MESSAGES.INVALID_NAME_WITH_HYPHEN,
  //     {
  //       name: COMMON_TEXT.COUNTRY,
  //     },
  //   ),
  //   minLength: 3,
  //   maxLength: 25,
  // }),
  // phone_number: phoneNumberSchema,
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
  phone_number: phoneNumberSchema,
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
  // user_name: userNameSchema,
  // country: createStringValidationSchema({
  //   name: COMMON_TEXT.COUNTRY,
  //   regex: REGEX.FIRST_NAME,
  //   regexMessage: getValidationMessageWithTranslation(
  //     VALIDATION_MESSAGES.INVALID_NAME_WITH_HYPHEN,
  //     {
  //       name: COMMON_TEXT.COUNTRY,
  //     },
  //   ),
  //   minLength: 3,
  //   maxLength: 25,
  // }),
  // phone_number: phoneNumberSchema,
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

// US Social Security Number validation function
// Format: XXX-XX-XXXX or XXXXXXXXX (9 digits)
// Cannot start with 000, 666, or 900-999
// Middle group cannot be 00
// Last group cannot be 0000
export const validateSSN = (value: string | undefined): boolean => {
  if (!value) return false;

  // Remove hyphens and spaces
  const cleaned = value.replace(/[-\s]/g, '');

  // Must be exactly 9 digits
  if (!REGEX.SSN.test(cleaned)) return false;

  // Cannot start with 000, 666, or 900-999
  const firstThree = cleaned.substring(0, 3);
  if (firstThree === '000' || firstThree === '666' || parseInt(firstThree) >= 900) {
    return false;
  }

  // Middle group cannot be 00
  const middleTwo = cleaned.substring(3, 5);
  if (middleTwo === '00') return false;

  // Last group cannot be 0000
  const lastFour = cleaned.substring(5, 9);
  if (lastFour === '0000') return false;

  return true;
};

// Driver License Number schema
const driverLicenseSchema = createStringValidationSchema({
  regex: REGEX.DRIVER_LICENSE,
  regexMessage: VALIDATION_MESSAGES.INVALID_DRIVER_LICENSE,
  name: 'Driver License Number',
  minLength: 6,
  maxLength: 14,
}).transform(value => value?.trim().toUpperCase());

// Social Security Number schema
const socialSecurityNumberSchema = string()
  .required(() =>
    getValidationMessageWithTranslation(VALIDATION_MESSAGES.IS_REQUIRED, {
      name: 'Social Security Number',
    }),
  )
  .test(
    'valid-ssn',
    () => getValidationMessageWithTranslation(VALIDATION_MESSAGES.INVALID_SSN, {}),
    validateSSN,
  )
  .transform(value => value?.replace(/[-\s]/g, ''));

/// Required image - accepts existing URL string OR new SelectedMedia object (for edit/update)

export const requiredImageSchema = mixed()
  .required(() =>
    getValidationMessageWithTranslation(VALIDATION_MESSAGES.IS_REQUIRED, {
      name: 'Image',
    }),
  )
  .test(
    'is-valid-image',
    () =>
      getValidationMessageWithTranslation(VALIDATION_MESSAGES.IS_REQUIRED, {
        name: 'Image',
      }),
    value => {
      if (!value) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'object' && value !== null) {
        const obj = value as { uri?: string };
        return typeof obj.uri === 'string' && obj.uri.trim().length > 0;
      }
      return false;
    },
  );

// Image upload schema (optional) - accepts existing URL string OR new SelectedMedia object (for edit/update)
const optionalImageSchema = mixed()
  .nullable()
  .optional()
  .test('is-valid-image', 'Invalid image', value => {
    if (!value) return true;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object' && value !== null) {
      const obj = value as { uri?: string };
      return typeof obj.uri === 'string' && obj.uri.trim().length > 0;
    }
    return false;
  });

// Documentation Upload validation schema
export const documentationUploadValidationSchema = createObjectShape({
  driver_license_number: driverLicenseSchema,
  social_security_number: socialSecurityNumberSchema,
  driver_license_front: requiredImageSchema,
  driver_license_back: requiredImageSchema,
  business_license: requiredImageSchema,
  insurance_document: optionalImageSchema,
});

export const professionalDetailsValidationSchema = createObjectShape({
  years_of_experience: createStringValidationSchema({
    name: 'Years of Experience',
    minLength: 1,
    maxLength: 2,
  }),
  services_offered: createStringValidationSchema({
    name: 'Services Offered',
    minLength: 1,
    maxLength: 255,
  }),
  service_radius: createStringValidationSchema({
    name: 'Service Radius',
    minLength: 1,
    maxLength: 255,
  }),

  service_area: createStringValidationSchema({
    name: 'Service Area',
    minLength: 1,
    maxLength: 255,
  }),
  zip_code: createStringValidationSchema({
    name: 'Zip Code',
    minLength: 1,
    maxLength: 255,
  }),
});

// Book Service Provider validation schema
export const bookServiceProviderValidationSchema = ({
  type,
}: {
  type: 'inhouse' | 'tow-to-shop';
}) => {
  const baseSchema = {
    images: array()
      .of(mixed())
      .min(1, 'At least one vehicle picture is required')
      .required(() =>
        getValidationMessageWithTranslation(VALIDATION_MESSAGES.IS_REQUIRED, {
          name: 'Vehicle picture',
        }),
      ),
    vehicle_model: createStringValidationSchema({
      name: 'Vehicle Make & Model',
      minLength: 2,
      minLengthMessage: 'Vehicle Make & Model must be at least 2 characters',
      maxLength: 30,
      maxLengthMessage: 'Vehicle Make & Model must not exceed 30 characters',
    }),
    vehicle_year: createStringValidationSchema({
      name: 'Vehicle Year',
    }),
    damage_type: mixed().required(() =>
      getValidationMessageWithTranslation(VALIDATION_MESSAGES.IS_REQUIRED, { name: 'Damage Type' }),
    ),
    additional_notes: createStringValidationSchema({
      name: 'Additional notes',
      minLength: 10,
      minLengthMessage: 'Additional notes must be at least 10 characters',
      maxLength: 500,
      maxLengthMessage: 'Additional notes must not exceed 500 characters',
    }),
    // dropoff_location: createStringValidationSchema({
    //   name: type === 'inhouse' ? 'Drop-off location' : 'Address',
    //   minLength: 5,
    //   minLengthMessage:
    //     type === 'inhouse'
    //       ? 'Please enter a valid drop-off location'
    //       : 'Please enter a valid address',
    // }),
  };

  // Only include pickup_date for "inhouse" type
  if (type === 'inhouse') {
    return createObjectShape({
      ...baseSchema,
      pickup_date: createStringValidationSchema({
        name: 'Preferred Pick-up date',
      }),
    });
  }

  // For "tow-to-shop" type: exclude pickup_date
  return createObjectShape(baseSchema);
};

// Format SSN for display (XXX-XX-XXXX)
export const formatSSN = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/[-\s]/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
};

export const signUpValidationSchemaWithProfileImage = ({ role }: { role: import('types/auth').USER_TYPE }) => {
  if (isWorkerRole(role)) {
    return signUpValidationSchema.shape({
      profile_image: requiredImageSchema,
    });
  }
  return signUpValidationSchema;
};

export const editProfileValidationSchemaWithProfileImage = ({
  isDentor,
}: {
  isDentor: boolean;
}) => {
  if (isDentor) {
    return editProfileValidationSchema.shape({
      profile_image: requiredImageSchema,
    });
  }
  return editProfileValidationSchema;
};
