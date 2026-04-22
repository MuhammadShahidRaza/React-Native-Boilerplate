import { LANGUAGES } from 'constants/common';
import { useTranslation as useI18nTranslation } from 'react-i18next';
// import English from 'i18n/languages/english.json';

// type StringKeyPaths<T, Prefix extends string = ''> = T extends Record<
//   string,
//   any
// >
//   ? {
//       [K in keyof T]: T[K] extends Record<string, any>
//         ? StringKeyPaths<T[K], `${Prefix}${K & string}.`>
//         : T[K] extends string
//         ? `${Prefix}${K & string}`
//         : never;
//     }[keyof T]
//   : never;
// export type LangTypes = StringKeyPaths<typeof English>;

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const isLangRTL = i18n.language === LANGUAGES.ARABIC;

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return { t, i18n, isLangRTL, changeLanguage };
};
