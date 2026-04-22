import { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Icon, Photo, RowComponent, Typography } from 'components/index';
import { COLORS, STYLES } from 'utils/index';
import { Booking, FontSize, FontWeight, useAppSelector } from 'types/index';
import { IMAGES } from 'constants/assets';
import {
  screenHeight,
  screenWidth,
  safeString,
  getBookingPrice,
  getDentorFromBooking,
} from '../../utils/helpers/functions';
import { VARIABLES } from 'constants/common';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { APP_CONFIG } from 'config/app';

// Activity Status Enum
enum ActivityStatus {
  Requested = 'Requested',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface BookingInfoBoxProps {
  item: Booking;
  style?: object;
  showBiddingSection?: boolean;
  showDateSection?: boolean;
}

export const BookingInfoBox = memo<BookingInfoBoxProps>(({ item, style, showBiddingSection }) => {
  const status = item?.status as ActivityStatus;
  const role = useAppSelector(state => state?.user?.role);
  const other = role === APP_CONFIG.PROVIDER_ROLE ? item?.user : item?.dentor;
  const price = getBookingPrice(item);
  // Render bottom buttons based on status
  const renderBottomButtons = () => {
    switch (status) {
      case ActivityStatus.Confirmed:
        if (item.sub_type === 'In-Progress') {
          const statusOfAssignment = item?.booking_assignments?.[0]?.status;
          const isPending = statusOfAssignment == 'upcoming';
          return (
            <Button
              title={isPending ? 'Pending' : 'View Proof Of Verification'}
              disabled={isPending}
              onPress={() =>
                navigate(SCREENS.PROOF_OF_VERIFICATION, { isEditable: false, bookingId: item?.id })
              }
              style={[styles.bottomButton, styles.secondaryButton, styles.fullWidthButton]}
              textStyle={styles.secondaryButtonText}
            />
          );
        }
        return null;

      case ActivityStatus.Completed:
        if (item?.review) {
          const rev = item.review;
          return (
            <Button
              title='View Review'
              onPress={() => {
                navigate(SCREENS.ADD_REVIEW, {
                  bookingId: item?.id,
                  isNotEditable: true,
                  userToReview: getDentorFromBooking(item as any, undefined),
                  booking: item,
                  review: { rating: rev.rating, comment: rev.comment },
                });
              }}
              style={[styles.bottomButton, styles.primaryButton, styles.fullWidthButton]}
              textStyle={styles.primaryButtonText}
            />
            // <View style={styles.completedButtons}>
            //   <Button
            //     title='View Review'
            //     onPress={() => {
            //       navigate(SCREENS.ADD_REVIEW, {
            //         bookingId: item?.id,
            //         userToReview: getDentorFromBooking(item as any, undefined),
            //         booking: item,
            //         review: { rating: rev.rating, comment: rev.comment },
            //       });
            //     }}
            //     style={[styles.bottomButton, styles.primaryButton, styles.halfButton]}
            //     textStyle={styles.primaryButtonText}
            //   />
            //   <Button
            //     title='Give Tip'
            //     onPress={() => {
            //       navigate(SCREENS.TIP_DENTOR, {
            //         bookingId: item?.id,
            //         userToTip: getDentorFromBooking(item as any, undefined),
            //         booking: item,
            //       });
            //     }}
            //     style={[styles.bottomButton, styles.secondaryButton, styles.halfButton]}
            //     textStyle={styles.secondaryButtonText}
            //   />
            // </View>
          );
        }
        return (
          <Button
            title='Add Review'
            onPress={() => {
              navigate(SCREENS.ADD_REVIEW, {
                bookingId: item?.id,
                userToReview: getDentorFromBooking(item as any, undefined),
                booking: item,
              });
            }}
            style={[styles.bottomButton, styles.primaryButton, styles.fullWidthButton]}
            textStyle={styles.primaryButtonText}
          />
          // <View style={styles.completedButtons}>
          //   <Button
          //     title='Add Review'
          //     onPress={() => {
          //       navigate(SCREENS.ADD_REVIEW, {
          //         bookingId: item?.id,
          //         userToReview: getDentorFromBooking(item as any, undefined),
          //         booking: item,
          //       });
          //     }}
          //     style={[styles.bottomButton, styles.primaryButton, styles.halfButton]}
          //     textStyle={styles.primaryButtonText}
          //   />
          //   <Button
          //     title='Give Tip'
          //     onPress={() => {
          //       navigate(SCREENS.TIP_DENTOR, {
          //         bookingId: item?.id,
          //         userToTip: getDentorFromBooking(item as any, undefined),
          //         booking: item,
          //       });
          //     }}
          //     style={[styles.bottomButton, styles.secondaryButton, styles.halfButton]}
          //     textStyle={styles.secondaryButtonText}
          //   />
          // </View>
        );

      default:
        return null;
    }
  };

  // Render right side content based on status
  const renderRightContent = () => {
    switch (status) {
      case ActivityStatus.Requested:
        return null; // Badge is rendered separately at top

      case ActivityStatus.Confirmed:
        return (
          <View style={styles.rightContentContainer}>
            {price && (
              <Typography
                style={[styles.heading, styles.priceText]}
              >{`$${Number(price).toFixed(2)}`}</Typography>
            )}
            <TouchableOpacity
              style={styles.chatIconContainer}
              activeOpacity={0.7}
              onPress={() => {
                if (other?.id) {
                  navigate(SCREENS.MESSAGES_FIREBASE, {
                    data: { otherUserId: other.id, bookingId: item?.id },
                  });
                }
              }}
            >
              <Icon
                iconName='chat'
                componentName={VARIABLES.MaterialIcons}
                size={18}
                color={COLORS.PRIMARY}
                iconStyle={styles.chatIcon}
              />
            </TouchableOpacity>
          </View>
        );

      case ActivityStatus.Completed:
        return (
          <View style={styles.rightContentContainer}>
            {price && (
              <Typography
                style={[styles.heading, styles.priceText]}
              >{`$${Number(price).toFixed(2)}`}</Typography>
            )}
          </View>
        );

      case ActivityStatus.Cancelled:
        return (
          <View style={styles.rightContentContainer}>
            {price && (
              <Typography
                style={[styles.heading, styles.priceText]}
              >{`$${Number(price).toFixed(2)}`}</Typography>
            )}
          </View>
        );

      default:
        return price ? (
          <Typography
            style={[styles.heading, styles.priceText]}
          >{`$${Number(price).toFixed(2)}`}</Typography>
        ) : null;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        navigate(SCREENS.JOB_DETAIL, {
          jobId: item.id,
          status: item.status,
          subType: item.sub_type,
          serviceType: item.service_type?.name,
        });
      }}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          paddingVertical: status === ActivityStatus.Requested && showBiddingSection ? 20 : 10,
        },
        style,
      ]}
    >
      {status === ActivityStatus.Requested && showBiddingSection && (
        <View style={styles.bidsReceivedContainer}>
          <Typography
            style={styles.bidsReceivedText}
          >{`${item?.quotations_count ?? 0} Bids Received`}</Typography>
        </View>
      )}
      <RowComponent style={styles.innerRow}>
        <Photo
          containerStyle={styles.photoContainer}
          imageStyle={styles.photoImage}
          source={IMAGES.BOX_CAR}
        />
        <View style={styles.infoCol}>
          {item?.vehicle_make && (
            <Typography
              numberOfLines={1}
              style={styles.heading}
            >{`${safeString(item.vehicle_make)} ${item.vehicle_year}`}</Typography>
          )}
          <RowComponent style={styles.infoRow}>
            {item?.service?.name && (
              <Typography style={styles.label}>{item?.service?.abbreviation}</Typography>
            )}
            <Typography style={styles.label}>{`●`}</Typography>
            {item?.service_type?.name && (
              <View style={styles.serviceTypeWrapper}>
                <Typography
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  style={styles.serviceTypeText}
                >{`${item?.service_type?.name}`}</Typography>
              </View>
            )}
          </RowComponent>

          {/* {item?.service_provider && (
            <RowComponent style={styles.infoRow}>
              <Typography style={styles.labelHeading}>Service Provider</Typography>
              <Typography style={styles.label}>{`(${item.service_provider})`}</Typography>
            </RowComponent>
          )} */}
          {/* {item?.date && showDateSection && (
            <RowComponent style={styles.infoRow}>
              <Typography style={styles.labelHeading}>Date</Typography>
              <Typography style={styles.label}>{`(${formatDateMonthDayYear(item.date)})`}</Typography>
            </RowComponent>
          )} */}
          {item?.drop_off_address && (
            <RowComponent style={[styles.infoRow, { gap: 2 }]}>
              <Icon
                iconName='location'
                componentName={VARIABLES.EvilIcons}
                size={20}
                color={COLORS.TEXT}
              />
              <Typography numberOfLines={1} ellipsizeMode='middle' style={styles.label}>
                {item.drop_off_address}
              </Typography>
            </RowComponent>
          )}
          {renderBottomButtons()}
        </View>
        <View style={styles.rightContentWrapper}>{renderRightContent()}</View>
      </RowComponent>
    </TouchableOpacity>
  );
});

BookingInfoBox.displayName = 'BookingInfoBox';

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.SURFACE,
    padding: 10,
    borderRadius: 15,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
    // shadowColor: COLORS.PLACEHOLDER,
    position: 'relative',
  },
  innerRow: {
    gap: 10,
    alignItems: 'flex-start',
    flex: 1,
  },
  rightContentWrapper: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
  },
  photoContainer: {
    borderRadius: 10,
    padding: 5,
    // backgroundColor: COLORS.PRIMARY,
    width: screenWidth(15),
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    // tintColor: COLORS.TEXT,
  },
  infoCol: {
    gap: 3,
    flex: 1,
    // minWidth: 0,
    marginRight: 10,
  },
  infoRow: {
    gap: 3,
    // flex: 1,
    // minWidth: 0,
    justifyContent: 'flex-start',
  },
  serviceTypeWrapper: {
    flex: 1,
    minWidth: 0,
  },
  serviceTypeText: {
    fontSize: FontSize.MediumSmall,
    textTransform: 'capitalize',
  },
  label: {
    fontSize: FontSize.MediumSmall,
  },
  labelHeading: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
  },
  heading: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
  },
  rightContentContainer: {
    justifyContent: 'space-between',
    // height: screenHeight(11),
    alignItems: 'flex-end',
    gap: 10,
  },
  priceText: {
    color: COLORS.PRIMARY,
  },
  chatIconContainer: {
    alignSelf: 'flex-end',
  },
  chatIcon: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: 50,
    padding: 10,
  },
  reviewButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginRight: -5,
  },
  reviewButtonText: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
  proofButton: {
    backgroundColor: COLORS.TEXT_SECONDARY,
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginRight: -5,
  },
  proofButtonText: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
  bottomButton: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  fullWidthButton: {
    width: '100%',
    alignSelf: 'flex-start',
  },
  // completedButtons: {
  //   flexDirection: 'row',
  //   gap: 10,
  //   width: '100%',
  // },
  // halfButton: {
  //   flex: 1,
  //   alignSelf: 'flex-start',
  // },
  primaryButton: {
    backgroundColor: COLORS.TEXT,
  },
  primaryButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
  secondaryButton: {
    backgroundColor: COLORS.TEXT,
  },
  secondaryButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
  },
  bidsReceivedContainer: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 3,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    zIndex: 1,
  },
  bidsReceivedText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
  },
});
