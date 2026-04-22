import { StyleSheet, View } from 'react-native';
import { Icon, Photo, RowComponent, SkeletonWrapper, Typography, Wrapper } from 'components/common';
import { VARIABLES } from 'constants/common';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { useServices } from 'hooks/useServices';
import type { Service } from 'types/responseTypes';

export const ServiceType = () => {
  const { services } = useServices();

  const isLoading = !services?.length;

  const handleServicePress = (service: Service) => {
    navigate(SCREENS.BOOK_SERVICE_PROVIDER, { service });
  };

  return (
    <Wrapper headerTitle='Service Type'>
      <View style={styles.container}>
        <SkeletonWrapper count={2} isLoading={isLoading}>
          {services?.length > 0 &&
            services?.map(service => (
              <RowComponent
                style={styles.card}
                onPress={() => handleServicePress(service)}
                key={service.id}
                activeOpacity={0.7}
              >
                <View style={styles.imageWrap}>
                  <Photo source={service?.image} imageStyle={styles.photo} />
                </View>
                <View style={styles.content}>
                  <Typography style={styles.title} numberOfLines={2}>
                    {service.name}
                  </Typography>
                  {service.description ? (
                    <Typography style={styles.description}>{service.description}</Typography>
                  ) : null}
                </View>
                <Icon
                  componentName={VARIABLES.Entypo}
                  iconName='chevron-small-right'
                  color={COLORS.ICONS}
                  size={28}
                />
              </RowComponent>
            ))}
        </SkeletonWrapper>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
    gap: 15,
    marginTop: 20,
  },
  card: {
    ...STYLES.SHADOW,
    borderRadius: 15,
    paddingHorizontal: 10,
    gap: 15,
    backgroundColor: COLORS.SURFACE,
    // alignItems: 'flex-start',
  },
  imageWrap: {
    width: 85,
    height: 85,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  photo: {
    width: 85,
    height: 85,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  title: {
    fontWeight: FontWeight.Bold,
    textTransform: 'capitalize',
    color: COLORS.TEXT,
  },
  description: {
    marginTop: 2,
    fontSize: FontSize.MediumSmall,
    color: COLORS.TEXT_SECONDARY,
  },
});
