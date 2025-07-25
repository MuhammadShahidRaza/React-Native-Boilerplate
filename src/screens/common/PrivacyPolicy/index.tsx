import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, SCREENS } from 'constants/index';
import { STYLES } from 'utils/commonStyles';
import { AppScreenProps } from 'types/index';
import { getStaticPage } from 'api/functions/app/settings';
import { useTranslation } from 'hooks/useTranslation';

export type StaticPageType =
  | typeof COMMON_TEXT.PRIVACY_POLICY
  | typeof COMMON_TEXT.TERMS_AND_CONDITIONS
  | typeof COMMON_TEXT.ABOUT_US;

export type StaticPage = {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export const PrivacyPolicy = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.PRIVACY_POLICY>) => {
  const { t } = useTranslation();
  const [pageData, setPageData] = useState<StaticPage | null>(null);
  const pageType = route?.params.title as StaticPageType;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t(pageType),
    });
    (async () => {
      const page = await getStaticPage(pageType);
      if (page) {
        setPageData(page);
      }
    })();
  }, []);

  return (
    <Wrapper useScrollView showAppLoader>
      <View style={styles.container}>
        <Typography>{pageData?.description ?? 'Content not available.'}</Typography>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
  },
});
