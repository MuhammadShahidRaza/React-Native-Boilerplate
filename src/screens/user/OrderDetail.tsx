import React from 'react';
import { Wrapper } from 'components/common/Wrapper';
import {
  FlatListComponent,
  Header,
  Icon,
  MessageBox,
  orderStatusColor,
  Photo,
  RowComponent,
  Typography,
} from 'components/index';
import { AppScreenProps, FontSize, FontWeight } from 'types/index';
import { SCREENS } from 'constants/routes';
import { isIOS, screenWidth } from 'utils/helpers';
import { screenHeight } from 'utils/helpers';
import { StyleSheet, View } from 'react-native';
import { STYLES } from 'utils/commonStyles';
import { COLORS } from 'utils/colors';
import { TEMPORARY_TEXT } from 'constants/screens';
import { Map } from 'components/common/Map';
import { IMAGES } from 'constants/assets/images';
import { VARIABLES } from 'constants/common';

export const OrderDetail = ({ route }: AppScreenProps<typeof SCREENS.ORDER_DETAIL>) => {
  const data = route.params.data;

  const renderDetails = (heading: string, value: string) => {
    return (
      <View style={styles.detailsContainer}>
        <Typography style={styles.title}>{heading}</Typography>
        {value && <Typography style={styles.subtitle}>{value}</Typography>}
      </View>
    );
  };

  return (
    <Wrapper backgroundColor={COLORS.BLACK} darkMode={false} useScrollView={true}>
      <View style={styles.header}>
        <Header
          title={data.name}
          titleStyle={styles.headerTitle}
          showBackButton={true}
          backIconStyle={styles.backIcon}
          endIcon={
            <Icon
              onPress={() => {}}
              componentName={VARIABLES.AntDesign}
              iconName={false ? 'heart' : 'hearto'}
              color={false ? COLORS.SECONDARY : COLORS.SECONDARY}
              size={FontSize.MediumLarge}
              iconStyle={{
                ...STYLES.SHADOW,
                borderRadius: 100,
                padding: 10,
              }}
            />
          }
        />

        <View style={styles.headerContent}>
          <FlatListComponent
            data={[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]}
            contentContainerStyle={{
              gap: 10,
            }}
            style={{
              marginTop: 10,
              backgroundColor: 'red',
            }}
            renderItem={({ item }) => {
              return (
                <Photo
                  source={data.image}
                  imageStyle={{
                    width: 100,
                    height: 50,
                    borderRadius: 20,
                    ...STYLES.SHADOW,
                  }}
                />
              );
            }}
          />
          <Typography
            style={{
              color: COLORS.WHITE,
              backgroundColor: orderStatusColor[data?.status as keyof typeof orderStatusColor],
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
              left: -30,
              bottom: 40,
              textAlign: 'center',
              fontSize: FontSize.Small,
              width: screenWidth(50),
              fontWeight: FontWeight.Bold,
            }}
          >{`Booking Status:  ${data.status}`}</Typography>
          <Typography style={styles.headerTitle}>{data.name}</Typography>
          <RowComponent style={{ justifyContent: 'flex-start' }}>
            <Typography style={{ color: COLORS.WHITE, ...STYLES.TEXT_SHADOW }}>
              {'London - '}
            </Typography>
            <Typography style={{ color: COLORS.WHITE, ...STYLES.TEXT_SHADOW }}>UK</Typography>
          </RowComponent>

          <RowComponent
            style={{
              justifyContent: 'flex-start',
              gap: 10,
            }}
          >
            {/* {item?.rating && ( */}
            <RowComponent
              style={{
                justifyContent: 'flex-start',
                ...STYLES.SHADOW,
                borderRadius: 7,
                padding: 7,
                gap: 10,
                backgroundColor: COLORS.PRIMARY,
              }}
            >
              <Icon
                onPress={() => {}}
                componentName={VARIABLES.AntDesign}
                iconName={'star'}
                color={COLORS.WHITE}
                iconStyle={{ marginBottom: 2 }}
                size={FontSize.ExtraSmall}
              />

              <Typography style={{ color: COLORS.WHITE, fontSize: FontSize.ExtraSmall }}>
                4.2
              </Typography>
            </RowComponent>
            <RowComponent
              style={{
                justifyContent: 'flex-start',
                ...STYLES.SHADOW,
                borderRadius: 7,
                padding: 7,
                gap: 5,
                backgroundColor: COLORS.PRIMARY,
              }}
            >
              <Icon
                onPress={() => {}}
                componentName={VARIABLES.EvilIcons}
                iconName={'location'}
                color={COLORS.WHITE}
                iconStyle={{ marginBottom: isIOS() ? 0 : 5 }}
              />

              <Typography style={{ color: COLORS.WHITE, fontSize: FontSize.ExtraSmall }}>
                4.5 Miles
              </Typography>
            </RowComponent>
          </RowComponent>

          {/* )} */}
        </View>
      </View>
      <Photo source={data.image} imageStyle={styles.image} />

      <View style={styles.details}>
        {renderDetails('About Hotel', TEMPORARY_TEXT.LORUM_IPSUM)}
        {renderDetails('Check In / Check Out', `${data.created_at} - ${data.created_at}`)}
        {renderDetails('Rooms And Guests', '1 room, 2 persons')}
        {renderDetails('Total (Incl. Fees & Tax)', `$${data.price.toString()}`)}

        {renderDetails('Property Location', '')}
        <Photo source={IMAGES.MAP} imageStyle={styles.mapImage} />
        {renderDetails('Additional Details', TEMPORARY_TEXT.LORUM_IPSUM)}
        {renderDetails('QR Code', '')}
        <RowComponent style={styles.qrCodeContainer}>
          <View style={styles.qrCodeTextContainer}>
            {renderDetails('Lorem ipsum', TEMPORARY_TEXT.LORUM_IPSUM)}
          </View>
          <Photo source={IMAGES.QR_CODE} imageStyle={styles.qrCode} />
        </RowComponent>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backIcon: {
    color: COLORS.WHITE,
    ...STYLES.TEXT_SHADOW,
  },
  image: {
    width: screenWidth(100),
    height: screenHeight(50),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...STYLES.SHADOW,
  },
  details: {
    ...STYLES.CONTAINER,
    marginVertical: 25,
    gap: 15,
  },
  title: {
    fontWeight: FontWeight.Bold,
  },
  subtitle: {
    color: COLORS.DARK_GREY,
    fontSize: FontSize.MediumSmall,
  },
  detailsContainer: {
    gap: 5,
  },
  mapImage: {
    width: screenWidth(90),
    height: screenHeight(20),
    borderRadius: 15,
  },
  messageBox: {
    marginHorizontal: 20,
  },
  qrCodeContainer: {
    ...STYLES.SHADOW,
    borderRadius: 15,
    padding: 10,
  },
  qrCode: {
    width: screenWidth(30),
    height: screenHeight(15),
    marginLeft: 10,
    borderRadius: 10,
  },
  qrCodeTextContainer: {
    width: screenWidth(isIOS() ? 50 : 52),
  },
  headerContent: {
    ...STYLES.CONTAINER,
    gap: 15,
    top: screenHeight(isIOS() ? 13 : 18),
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    width: screenWidth(60),
    fontSize: FontSize.MediumLarge,
    ...STYLES.TEXT_SHADOW,
  },
  headerSubtitle: {
    color: COLORS.DARK_GREY,
    fontSize: FontSize.MediumSmall,
  },
});
