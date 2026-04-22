// export const REGEX = {
//   EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
//   PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
//   URL: /^((?!https:\/\/|http:\/\/).)*www\.[a-zA-Z0-9-]+\.com/,
//   CARD_NUMBER: /^\d{4} \d{4} \d{4} \d{4}$/,
//   PHONE_NUMBER: /^\+[0-9]{10,16}$/,
//   USERNAME: /^[a-zA-Z0-9_]+$/,
//   VERIFICATION: /^\d{6}$/,
//   EXPIRY_DATE: /^(0[1-9]|1[0-2])\/\d{2}$/,
//   CVV: /^\d{3}$/,
//   REMOVE_SPACES: /\s/g,
//   FIRST_NAME:
//     /^(?!.*(?:'{2,}|-{2,}))(?!.*(?:[a-zA-Z]'-|-'[a-zA-Z]))[a-zA-Z\u00C0-\u017F]+(?:[-'][a-zA-Z\u00C0-\u017F]+)*(?: [a-zA-Z\u00C0-\u017F]+(?:[-'][a-zA-Z\u00C0-\u017F]+)*){0,24}$/,
// };

export const REGEX = {
  /** Rejects repeated TLDs like .com.com.com */
  EMAIL:
    /^(?!\.)(?!.*(\.\w{2,})\1)([\p{L}\p{M}\p{N}._%+-]{1,64})@[\p{L}\p{N}-]{1,63}(\.[\p{L}\p{N}-]{1,63})*\.[\p{L}]{2,10}$/u,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, // Adjusted to include at least 8 characters and allow any letter and number and symbol.
  URL: /^((?!https:\/\/|http:\/\/).)*www\.[\p{L}\p{M}\p{N}-]+\.com$/u,
  CARD_NUMBER: /^\d{4} \d{4} \d{4} \d{4}$/,
  PHONE_NUMBER: /^[0-9]{7,16}$/,
  USERNAME: /^[\p{L}\p{N}_]+$/u,
  VERIFICATION: /^\d{6}$/,
  EXPIRY_DATE: /^(0[1-9]|1[0-2])\/\d{2}$/,
  CVV: /^\d{3}$/,
  REMOVE_SPACES: /\s/g,
  FIRST_NAME: /^[\p{L}\p{M}'-]+(?: [\p{L}\p{M}'-]+)*$/u,
  // US Driver License Number: 6-14 alphanumeric characters (varies by state)
  DRIVER_LICENSE: /^[A-Z0-9]{6,14}$/i,
  // US Social Security Number: 9 digits (format validation done in custom validator)
  SSN: /^\d{9}$/,
};
