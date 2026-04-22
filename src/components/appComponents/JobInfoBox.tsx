import { memo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button, Icon, Photo, RowComponent, Typography } from 'components/index';
import { COLORS, safeString, STYLES, getBookingPrice } from 'utils/index';
import { Booking, FontSize, FontWeight } from 'types/index';
import { useAppSelector } from 'types/reduxTypes';
import { IMAGES } from 'constants/assets';
import { screenWidth } from '../../utils/helpers/functions';
import { VARIABLES } from 'constants/common';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { JobStatus } from 'screens/user/MyJobs';
import {
  createQuotation,
  updateQuotation,
  submitProofOfVerification,
  updateDentorBookingStatus,
} from 'api/functions/app/home';
import { getDentorFromBooking } from 'utils/helpers/functions';
import { markConversationCompleted } from '../../services/chat/firestoreChat';
import { APP_CONFIG } from 'config/app';
import { BidModal } from './BidModal';
import { ReviewsModal } from './ReviewsModal';
import { VerificationPictureModal } from './VerificationPictureModal';

export interface JobInfoBoxProps {
  item: Booking;
  style?: object;
  showBiddingSection?: boolean;
  showDateSection?: boolean;
  onBidSuccess?: () => void;
  onProofSuccess?: () => void;
}

export const JobInfoBox = memo<JobInfoBoxProps>(({ item, style, onBidSuccess, onProofSuccess }) => {
  const role = useAppSelector(s => s.user.role);
  const status = item?.status ?? JobStatus.NewInquiries;
  const otherUser = role === APP_CONFIG.PROVIDER_ROLE ? item.user : item.dentor;
  const price = getBookingPrice(item);

  // Modal states
  const [isBidModalVisible, setIsBidModalVisible] = useState(false);
  const [isEditBidModalVisible, setIsEditBidModalVisible] = useState(false);
  const [isReviewsModalVisible, setIsReviewsModalVisible] = useState(false);
  const [isVerificationModalVisible, setIsVerificationModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<
    'decline' | 'cancel' | 'cancelJob' | 'start' | null
  >(null);

  const confirmWithAlert = (
    title: string,
    message: string,
    confirmText: string,
    loadingKey: 'decline' | 'cancel' | 'cancelJob',
    status: 'decline' | 'cancelled',
  ) => {
    Alert.alert(title, message, [
      { text: 'No', style: 'cancel' },
      {
        text: confirmText,
        style: 'destructive',
        onPress: async () => {
          if (!item?.id) return;
          setActionLoading(loadingKey);
          try {
            const res = await updateDentorBookingStatus({ booking_id: item.id, status });
            if (res) onBidSuccess?.();
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  // Render right side content based on status
  const renderRightContent = () => {
    switch (status) {
      case JobStatus.NewInquiries:
        return null; // Badge is rendered separately at top

      case JobStatus.Confirmed:
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
                if (otherUser?.id) {
                  navigate(SCREENS.MESSAGES_FIREBASE, {
                    data: { otherUserId: otherUser.id, bookingId: item?.id },
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

      case JobStatus.Completed:
        return (
          <View style={styles.rightContentContainer}>
            {price && (
              <Typography
                style={[styles.heading, styles.priceText]}
              >{`$${Number(price).toFixed(2)}`}</Typography>
            )}
          </View>
        );

      case JobStatus.BidPlaced:
        return null;

      default:
        return price ? (
          <Typography
            style={[styles.heading, styles.priceText]}
          >{`$${Number(price).toFixed(2)}`}</Typography>
        ) : null;
    }
  };
  // Render bottom buttons based on status and sub_type
  const renderBottomButtons = () => {
    switch (status) {
      case JobStatus.NewInquiries:
        return (
          <RowComponent style={styles.bottomButtonsContainer}>
            <Button
              title='Decline'
              style={[styles.bottomButton, styles.pairedButton, styles.outlineButton]}
              loading={actionLoading === 'decline'}
              loaderColor={COLORS.TEXT}
              onPress={() =>
                confirmWithAlert(
                  'Decline',
                  'Are you sure you want to decline this job?',
                  'Yes, Decline',
                  'decline',
                  'decline',
                )
              }
              textStyle={styles.outlineButtonText}
            />
            <Button
              title='Bid'
              onPress={() => setIsBidModalVisible(true)}
              style={[styles.bottomButton, styles.pairedButton, styles.primaryButton]}
              textStyle={styles.primaryButtonText}
            />
          </RowComponent>
        );

      case JobStatus.BidPlaced:
        return (
          <RowComponent style={styles.bottomButtonsContainer}>
            <Button
              title='Cancel'
              style={[styles.bottomButton, styles.pairedButton, styles.outlineButton]}
              loading={actionLoading === 'cancel'}
              loaderColor={COLORS.TEXT}
              onPress={() =>
                confirmWithAlert(
                  'Cancel Bid',
                  'Are you sure you want to cancel your bid?',
                  'Yes, Cancel',
                  'cancel',
                  'cancelled',
                )
              }
              textStyle={styles.outlineButtonText}
            />
            <Button
              title='Edit Bid'
              onPress={() => setIsEditBidModalVisible(true)}
              style={[styles.bottomButton, styles.pairedButton, styles.primaryButton]}
              textStyle={styles.primaryButtonText}
            />
          </RowComponent>
        );

      case JobStatus.Confirmed:
        const subType = item?.sub_type;
        if (subType === 'Upcoming') {
          return (
            <RowComponent style={styles.bottomButtonsContainer}>
              <Button
                title='Cancel'
                loading={actionLoading === 'cancelJob'}
                loaderColor={COLORS.TEXT}
                onPress={() =>
                  confirmWithAlert(
                    'Cancel Job',
                    'Are you sure you want to cancel this job? The booking will return to the pool so other technicians can place bids.',
                    'Yes, Cancel',
                    'cancelJob',
                    'cancelled',
                  )
                }
                style={[styles.bottomButton, styles.pairedButton, styles.outlineButton]}
                textStyle={styles.outlineButtonText}
              />
              <Button
                title='Start Job'
                loading={actionLoading === 'start'}
                onPress={async () => {
                  if (!item?.id) return;
                  setActionLoading('start');
                  try {
                    const res = await updateDentorBookingStatus({
                      booking_id: item.id,
                      status: 'in_progress',
                    });
                    if (res) onBidSuccess?.();
                  } finally {
                    setActionLoading(null);
                  }
                }}
                style={[styles.bottomButton, styles.pairedButton, styles.primaryButton]}
                textStyle={styles.primaryButtonText}
              />
            </RowComponent>
          );
        } else if (subType === 'In-Progress') {
          const statusOfAssignment = item?.booking_assignments?.[0]?.status;
          const isInProgress = statusOfAssignment == 'in_progress';
          return (
            <RowComponent style={styles.bottomButtonsContainer}>
              {/* <Button
                title='Cancel'
                loading={actionLoading === 'cancelJob'}
                loaderColor={COLORS.TEXT}
                onPress={() =>
                  confirmWithAlert(
                    'Cancel Job',
                    'Are you sure you want to cancel this job? The booking will return to the pool so other technicians can place bids.',
                    'Yes, Cancel',
                    'cancelJob',
                    'decline',
                  )
                }
                style={[styles.bottomButton, styles.pairedButton, styles.outlineButton]}
                textStyle={styles.outlineButtonText}
              /> */}
              <Button
                title={isInProgress ? 'Submitted' : 'Mark As Completed'}
                disabled={isInProgress}
                onPress={() =>
                  navigate(SCREENS.PROOF_OF_VERIFICATION, { isEditable: true, bookingId: item?.id })
                }
                style={[styles.bottomButton, styles.pairedButton, styles.primaryButton]}
                textStyle={styles.primaryButtonText}
              />
            </RowComponent>
          );
        }
        // else if (subType === 'Rejected') {
        //   return (
        //     <Button
        //       title='Re Add Proof Of Verification'
        //       // onPress={() => setIsVerificationModalVisible(true)}
        //       onPress={() => {
        //         // Handle re-add proof action
        //         navigate(SCREENS.PROOF_OF_VERIFICATION, { isEditable: true, bookingId: item?.id })
        //       }}
        //       style={[styles.bottomButton, styles.primaryButton, styles.fullWidthButton]}
        //       textStyle={styles.secondaryButtonText}
        //     />
        //   );
        // }
        return null;

      case JobStatus.Completed:
        return item?.review ? (
          <Button
            title='View Review'
            onPress={() => setIsReviewsModalVisible(true)}
            style={[
              styles.bottomButton,
              styles.primaryButton,
              {
                alignSelf: 'flex-start',
                marginTop: 5,
              },
            ]}
            textStyle={styles.primaryButtonText}
            endIcon={{
              iconName: 'right',
              componentName: VARIABLES.AntDesign,
              size: 12,
              color: COLORS.TEXT_INVERSE,
            }}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        navigate(SCREENS.JOB_DETAIL, {
          jobId: item?.id,
          status: item?.status,
          subType: item?.sub_type,
          serviceType: item?.service_type?.name,
        });
      }}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          paddingVertical: status === JobStatus.BidPlaced ? 22 : 10,
        },
        style,
      ]}
    >
      {status === JobStatus.BidPlaced && (
        <View style={styles.bidsplacedContainer}>
          <Typography style={styles.bidsplacedText}>
            {item?.quotations?.[0]?.amount
              ? `Bid Placed: $${item?.quotations?.[0]?.amount}`
              : 'Bid Placed'}
          </Typography>
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
            >{`${safeString(item?.vehicle_make)} ${safeString(item?.vehicle_year)}`}</Typography>
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
          {/* {item?.user?.full_name && (
            <RowComponent style={styles.infoRow}>
              <View style={styles.labelWrapper}>
                <Typography numberOfLines={1} ellipsizeMode='tail' style={styles.label}>{item?.user.full_name}</Typography>
              </View>
            </RowComponent>
          )} */}
          {/* {item?.created_at && showDateSection && (
            <RowComponent style={styles.infoRow}>
              <Typography style={styles.label}>{`${formatDateMonthDayYear(item?.created_at)}`}</Typography>
            </RowComponent>
          )} */}
          {(item?.drop_off_address || item?.pickup_address) && (
            <RowComponent style={[styles.infoRow, { gap: 2 }]}>
              <Icon
                iconName='location'
                componentName={VARIABLES.EvilIcons}
                size={20}
                color={COLORS.TEXT}
              />
              <View style={styles.labelWrapper}>
                <Typography numberOfLines={1} ellipsizeMode='middle' style={styles.label}>
                  {(item?.drop_off_address || item?.pickup_address) ?? ''}
                </Typography>
              </View>
            </RowComponent>
          )}
          {renderBottomButtons()}
        </View>
        <View style={styles.rightContentWrapper}>{renderRightContent()}</View>
      </RowComponent>

      {/* Modals */}
      <BidModal
        isVisible={isBidModalVisible}
        setIsVisible={setIsBidModalVisible}
        item={item}
        isEdit={false}
        onConfirm={async data => {
          if (!item?.id) return;
          const amount = parseFloat(data.bidAmount);
          const res = await createQuotation({
            booking_id: item.id,
            amount,
            drop_off_address: data.dropOffAddress,
            drop_off_latitude: data.dropOffLatitude,
            drop_off_longitude: data.dropOffLongitude,
          });
          if (res) {
            onBidSuccess?.();
          }
        }}
      />
      <BidModal
        isVisible={isEditBidModalVisible}
        setIsVisible={setIsEditBidModalVisible}
        item={item}
        isEdit={true}
        onConfirm={async data => {
          if (!item?.id || !item?.quotations?.[0]?.id) return;
          const amount = parseFloat(data.bidAmount);
          const res = await updateQuotation({
            quotation_id: item?.quotations?.[0]?.id,
            booking_id: item.id,
            amount,
            drop_off_address: data.dropOffAddress,
            drop_off_latitude: data.dropOffLatitude,
            drop_off_longitude: data.dropOffLongitude,
          });
          if (res) {
            onBidSuccess?.();
          }
        }}
      />
      <ReviewsModal
        isVisible={isReviewsModalVisible}
        setIsVisible={setIsReviewsModalVisible}
        item={item}
      />
      <VerificationPictureModal
        isVisible={isVerificationModalVisible}
        setIsVisible={setIsVerificationModalVisible}
        item={item}
        onConfirm={async image => {
          if (!item?.id) return;
          const res = await submitProofOfVerification({
            booking_id: item.id,
            proof_of_work: [
              { label: 'before', media: image },
              { label: 'after', media: image },
            ],
          });
          if (res) {
            const userId = item.user_id ?? item.user?.id;
            const dentorId = getDentorFromBooking(item, undefined)?.id;
            if (userId != null && dentorId != null && item?.id) {
              markConversationCompleted(String(userId), String(dentorId), String(item.id)).catch(
                () => {},
              );
            }
            onProofSuccess?.();
          }
        }}
      />
    </TouchableOpacity>
  );
});

JobInfoBox.displayName = 'JobInfoBox';

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
    width: screenWidth(15),
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  infoCol: {
    gap: 3,
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  infoRow: {
    gap: 3,
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-start',
  },
  serviceTypeWrapper: {
    flex: 1,
    minWidth: 0,
  },
  labelWrapper: {
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
    marginTop: 20,
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
  bidsplacedContainer: {
    position: 'absolute',
    right: -3,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 3,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    zIndex: 1,
  },
  bidsplacedText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
  },
  bottomButtonsContainer: {
    marginTop: 5,
    gap: 10,
    flexWrap: 'nowrap',
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  bottomButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    minWidth: 0,
  },
  pairedButton: {
    flex: 1,
    flexShrink: 1,
  },
  fullWidthButton: {
    width: '100%',
    alignSelf: 'flex-start',
  },
  halfWidthButton: {
    width: '70%',
    alignSelf: 'flex-start',
  },
  primaryButton: {
    backgroundColor: COLORS.TEXT,
  },
  primaryButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
  },
  outlineButton: {
    backgroundColor: COLORS.TRANSPARENT,
    borderWidth: 1,
    borderColor: COLORS.TEXT,
  },
  outlineButtonText: {
    color: COLORS.TEXT,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
  },
  secondaryButton: {
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  secondaryButtonText: {
    fontSize: FontSize.Small,
    padding: 3,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.BACKGROUND,
  },
  bottomButtonText: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
});
