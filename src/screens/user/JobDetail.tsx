import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Photo, RowComponent, Typography, Button, Icon, Wrapper, Header } from 'components/index';
import { COLORS, STYLES, safeString, screenHeight, screenWidth } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import { navigate, onBack } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { useAppSelector } from 'types/reduxTypes';
import { JobStatus } from './MyJobs';
import { ActivityStatus } from './Activities';
import { AppScreenProps } from 'types/navigation';
import { BidModal } from 'components/appComponents/BidModal';
import { ReviewsModal } from 'components/appComponents/ReviewsModal';
import { VerificationPictureModal } from 'components/appComponents/VerificationPictureModal';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDentorFromBooking } from 'utils/helpers/functions';
import { markConversationCompleted } from '../../services/chat/firestoreChat';
import { APP_CONFIG } from 'config/app';
import {
  getBookingDetailsById,
  createQuotation,
  updateQuotation,
  submitProofOfVerification,
  updateDentorBookingStatus,
  cancelUserBooking,
} from 'api/functions/app/home';
import { Booking } from 'types/responseTypes';

const getProofOfVerificationAfterUrl = (booking: Booking | null): string | null => {
  const attempts = booking?.booking_assignments?.[0]?.assignment_attempts ?? [];

  for (let index = attempts.length - 1; index >= 0; index -= 1) {
    const afterMedia = attempts[index]?.media?.find(
      media => media?.label?.trim()?.toLowerCase() === 'after' && !!media?.media_url,
    );

    if (afterMedia?.media_url) {
      return afterMedia.media_url;
    }
  }

  for (let index = attempts.length - 1; index >= 0; index -= 1) {
    const fallbackMedia = attempts[index]?.media?.find(media => !!media?.media_url);

    if (fallbackMedia?.media_url) {
      return fallbackMedia.media_url;
    }
  }

  return null;
};

/** API status → UI status & subType (dentor) */
const API_STATUS_TO_UI_DENTOR: Record<string, { status: string; subType: string }> = {
  pending: { status: JobStatus.NewInquiries, subType: '' },
  bidding: { status: JobStatus.BidPlaced, subType: '' },
  assigned: { status: JobStatus.Confirmed, subType: 'Upcoming' },
  upcoming: { status: JobStatus.Confirmed, subType: 'Upcoming' },
  in_progress: { status: JobStatus.Confirmed, subType: 'In-Progress' },
  rejected: { status: JobStatus.Confirmed, subType: 'Rejected' },
  completed: { status: JobStatus.Completed, subType: '' },
  cancelled: { status: 'Cancelled', subType: '' },
};

/** API status → UI status & subType (user) */
const API_STATUS_TO_UI_USER: Record<string, { status: string; subType: string }> = {
  pending: { status: ActivityStatus.Requested, subType: 'Quote Pending' },
  bidding: { status: ActivityStatus.Requested, subType: 'Bids Received' },
  assigned: { status: ActivityStatus.Confirmed, subType: 'Upcoming' },
  upcoming: { status: ActivityStatus.Confirmed, subType: 'Upcoming' },
  in_progress: { status: ActivityStatus.Confirmed, subType: 'In-Progress' },
  rejected: { status: ActivityStatus.Confirmed, subType: 'Rejected' },
  completed: { status: ActivityStatus.Completed, subType: '' },
  cancelled: { status: ActivityStatus.Cancelled, subType: '' },
};

const mapApiStatusToUi = (
  apiStatus: string | undefined,
  apiSubType: string | undefined,
  isDentor: boolean,
): { status: string; subType: string } => {
  const s = (apiStatus || '').toLowerCase().trim();
  const sub = apiSubType || '';
  const map = isDentor ? API_STATUS_TO_UI_DENTOR : API_STATUS_TO_UI_USER;
  const mapped = map[s];
  if (mapped) return { ...mapped, subType: mapped.subType || sub };
  // Already UI format from list tabs
  if (
    isDentor &&
    ['new inquiries', 'bid placed', 'confirmed', 'completed', 'cancelled'].includes(s)
  ) {
    return { status: apiStatus!, subType: sub };
  }
  if (!isDentor && ['requested', 'confirmed', 'completed', 'cancelled'].includes(s)) {
    return { status: apiStatus!, subType: sub };
  }
  // Unknown API status – default
  return {
    status: isDentor ? JobStatus.NewInquiries : ActivityStatus.Requested,
    subType: sub,
  };
};

const JobDetailSkeleton = () => (
  <View style={skeletonStyles.wrapper}>
    <View style={skeletonStyles.imageSection}>
      <SkeletonPlaceholder
        borderRadius={0}
        backgroundColor={COLORS.SKELETON_BACKGROUND}
        highlightColor={COLORS.SKELETON_HIGHLIGHT}
      >
        <SkeletonPlaceholder.Item
          width={screenWidth(100)}
          height={screenHeight(30)}
          borderRadius={0}
        />
      </SkeletonPlaceholder>
      <View style={skeletonStyles.damageType}>
        <SkeletonPlaceholder
          borderRadius={8}
          backgroundColor={COLORS.SKELETON_BACKGROUND}
          highlightColor={COLORS.SKELETON_HIGHLIGHT}
        >
          <SkeletonPlaceholder.Item width={screenWidth(60)} height={24} borderRadius={8} />
        </SkeletonPlaceholder>
      </View>
      <RowComponent style={skeletonStyles.thumbnails}>
        {[1, 2, 3, 4].map(i => (
          <SkeletonPlaceholder
            key={i}
            borderRadius={10}
            backgroundColor={COLORS.SKELETON_BACKGROUND}
            highlightColor={COLORS.SKELETON_HIGHLIGHT}
          >
            <SkeletonPlaceholder.Item
              width={screenWidth(15)}
              height={screenWidth(15)}
              borderRadius={10}
            />
          </SkeletonPlaceholder>
        ))}
      </RowComponent>
    </View>
    <View style={skeletonStyles.card}>
      <SkeletonPlaceholder
        borderRadius={12}
        backgroundColor={COLORS.SKELETON_BACKGROUND}
        highlightColor={COLORS.SKELETON_HIGHLIGHT}
      >
        <View style={skeletonStyles.cardRow}>
          <SkeletonPlaceholder.Item width={50} height={50} borderRadius={25} />
          <View style={skeletonStyles.cardInfo}>
            <SkeletonPlaceholder.Item
              width={screenWidth(40)}
              height={20}
              borderRadius={6}
              marginBottom={8}
            />
            <SkeletonPlaceholder.Item width={screenWidth(50)} height={24} borderRadius={6} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
    <View style={skeletonStyles.card}>
      <SkeletonPlaceholder
        borderRadius={12}
        backgroundColor={COLORS.SKELETON_BACKGROUND}
        highlightColor={COLORS.SKELETON_HIGHLIGHT}
      >
        <SkeletonPlaceholder.Item
          width={screenWidth(30)}
          height={22}
          borderRadius={6}
          marginBottom={15}
        />
        {[1, 2, 3, 4].map(i => (
          <SkeletonPlaceholder.Item
            key={i}
            width={screenWidth(80)}
            height={18}
            borderRadius={6}
            marginBottom={12}
          />
        ))}
      </SkeletonPlaceholder>
    </View>
  </View>
);

const skeletonStyles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20 },
  imageSection: {
    marginBottom: 20,
    backgroundColor: COLORS.SURFACE,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  damageType: { paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center' },
  thumbnails: { paddingHorizontal: 20, gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  card: { marginBottom: 15, padding: 20, borderRadius: 15, backgroundColor: COLORS.SURFACE },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  cardInfo: { flex: 1 },
});

export const JobDetail: React.FC<AppScreenProps<typeof SCREENS.JOB_DETAIL>> = ({ route }) => {
  const role = useAppSelector(state => state?.user?.role);
  const isDentor = role === APP_CONFIG.PROVIDER_ROLE;
  const insetBottom = useSafeAreaInsets().bottom;
  const params = route?.params;
  const [jobData, setJobData] = useState<Booking | null>(null);
  // Prefer jobData (API format) when loaded; params may be UI format from list tabs
  const apiStatus = jobData?.status ?? params?.status;
  const apiSubType = jobData?.sub_type ?? params?.subType;
  const mapped = apiStatus
    ? mapApiStatusToUi(String(apiStatus), String(apiSubType || ''), isDentor)
    : null;
  const status = mapped?.status ?? (isDentor ? JobStatus.NewInquiries : ActivityStatus.Requested);
  const subType = mapped?.subType ?? apiSubType ?? '';

  // Modal states
  const [isBidModalVisible, setIsBidModalVisible] = useState(false);
  const [isEditBidModalVisible, setIsEditBidModalVisible] = useState(false);
  const [isReviewsModalVisible, setIsReviewsModalVisible] = useState(false);
  const [isVerificationModalVisible, setIsVerificationModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<
    'decline' | 'cancel' | 'cancelJob' | 'start' | 'complete' | 'cancelBooking' | null
  >(null);

  // const jobData = {
  //   vehicleMake: 'Audi',
  //   vehicleModel: 'A5',
  //   vehicleYear: '2025',
  //   damageType: 'Paint Peel',
  //   pickupDate: '31/12/25',
  //   pickupLocation: 'Tampa Florida',
  //   dropoffLocation: 'Tampa Florida',
  //   additionalNotes:
  //     'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  //   customerName: 'David Doe',
  //   customerImage: IMAGES.USER_IMAGE,
  //   serviceType: route?.params?.serviceType || 'Paint & Body Work',
  //   images: [
  //     IMAGES.CAR_ONE, // Main car image
  //     IMAGES.CAR_THREE, // Thumbnail 2
  //     IMAGES.CAR_FOUR, // Thumbnail 3
  //     IMAGES.CAR_TWO, // Thumbnail 1
  //     IMAGES.CAR_FIVE, // Thumbnail 4
  //   ],
  // };

  const fetchBookingDetails = useCallback(async () => {
    if (!params?.jobId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await getBookingDetailsById({ id: params.jobId.toString(), isDentor });
      if (response) setJobData(response);
    } finally {
      setIsLoading(false);
    }
  }, [params?.jobId, isDentor]);

  useFocusEffect(
    useCallback(() => {
      fetchBookingDetails();
    }, [fetchBookingDetails]),
  );

  const currentUserId = useAppSelector(state => state?.user?.userDetails?.id);
  const otherPerson = isDentor
    ? jobData?.user
    : (jobData?.dentor ?? getDentorFromBooking(jobData ?? null, currentUserId));
  const proofOfVerificationAfterUrl = getProofOfVerificationAfterUrl(jobData);

  const handleChatPress = () => {
    if (otherPerson?.id) {
      navigate(SCREENS.MESSAGES_FIREBASE, {
        data: { otherUserId: otherPerson.id, bookingId: jobData?.id },
      });
    }
  };

  const handleStartJob = async () => {
    if (!jobData?.id) return;
    setActionLoading('start');
    try {
      const res = await updateDentorBookingStatus({
        booking_id: jobData.id,
        status: 'in_progress',
      });
      if (res) onBack();
    } finally {
      setActionLoading(null);
    }
  };

  const confirmCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: handleCancelBooking },
      ],
    );
  };

  const confirmDentorCancelJob = () => {
    Alert.alert('Cancel Job', 'Are you sure you want to cancel this job?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: handleDentorCancelJob },
    ]);
  };

  const handleDentorCancelJob = async () => {
    if (!jobData?.id) return;
    setActionLoading('cancelJob');
    try {
      const res = await updateDentorBookingStatus({
        booking_id: jobData.id,
        status: 'cancelled',
      });
      if (res) onBack();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!jobData?.id) return;
    setActionLoading('cancelBooking');
    try {
      if (isDentor) {
        const res = await updateDentorBookingStatus({
          booking_id: jobData.id,
          status: 'cancelled',
        });
        if (res) onBack();
      } else {
        const res = await cancelUserBooking({ booking_id: jobData.id });
        if (res) onBack();
      }
    } catch (error) {
      onBack();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteJob = () => {
    // setIsVerificationModalVisible(true)
    navigate(SCREENS.PROOF_OF_VERIFICATION, { isEditable: true, bookingId: jobData?.id });
    // Handle complete job action
    // onBack();
  };

  const handleViewReview = () => {
    const personToReview =
      otherPerson ?? (isDentor ? jobData?.user : getDentorFromBooking(jobData ?? null, undefined));
    navigate(SCREENS.ADD_REVIEW, {
      bookingId: jobData?.id,
      isNotEditable: true,
      userToReview: personToReview,
      booking: jobData ?? undefined,
      review: jobData?.review
        ? { rating: jobData.review.rating, comment: jobData.review.comment }
        : undefined,
    });
  };
  const handleAddReview = () => {
    navigate(SCREENS.ADD_REVIEW, {
      bookingId: jobData?.id,
      userToReview: getDentorFromBooking(jobData as any, undefined),
      booking: jobData ?? undefined,
    });
  };
  const handleGiveTip = () => {
    navigate(SCREENS.TIP_DENTOR, {
      bookingId: jobData?.id,
      userToTip: otherPerson,
      booking: jobData ?? undefined,
    });
  };

  const handleViewBids = () => {
    // Handle view bids action
    navigate(SCREENS.ALL_BIDS, {
      data: {
        jobId: jobData?.id,
      },
    });
  };

  const handleBidAction = () => {
    setIsBidModalVisible(true);
  };

  const handleDeclineBidAction = async (loadingKey: 'decline' | 'cancel' = 'decline') => {
    if (!jobData?.id) return;
    setActionLoading(loadingKey);
    try {
      const res = await updateDentorBookingStatus({ booking_id: jobData.id, status: 'cancelled' });
      if (res) onBack();
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeclineOrCancelBid = (
    title: string,
    message: string,
    loadingKey: 'decline' | 'cancel' = 'decline',
  ) => {
    Alert.alert(title, message, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => handleDeclineBidAction(loadingKey),
      },
    ]);
  };

  // Get status badge color
  const getStatusBadgeColor = () => {
    if (isDentor) {
      switch (status) {
        case JobStatus.NewInquiries:
          return COLORS.PRIMARY;
        case JobStatus.BidPlaced:
          return COLORS.PRIMARY;
        case JobStatus.Confirmed:
          if (subType === 'Upcoming') return COLORS.PRIMARY;
          if (subType === 'In-Progress') return COLORS.PRIMARY;
          // if (subType === 'Rejected') return COLORS.RED;
          return COLORS.PRIMARY;
        case JobStatus.Completed:
          return COLORS.GREEN_STATUS || COLORS.GREEN;
        case 'Cancelled':
          return COLORS.RED;
        default:
          return COLORS.PRIMARY;
      }
    } else {
      switch (status) {
        case ActivityStatus.Requested:
          return COLORS.PRIMARY;
        case ActivityStatus.Confirmed:
          return COLORS.PRIMARY;
        case ActivityStatus.Completed:
          return COLORS.GREEN_STATUS || COLORS.GREEN;
        case ActivityStatus.Cancelled:
          return COLORS.RED;
        default:
          return COLORS.PRIMARY;
      }
    }
  };

  // Check if action button should be shown
  const hasActionButton = () => {
    if (isDentor) {
      switch (status) {
        case JobStatus.Confirmed:
          if (subType === 'Upcoming' || subType === 'In-Progress' || subType === 'Rejected') {
            return true;
          }
          return false;
        case JobStatus.NewInquiries:
        case JobStatus.BidPlaced:
        case JobStatus.Completed:
          return true;
        default:
          return false;
      }
    } else {
      switch (status) {
        case ActivityStatus.Requested:
          return true;
        case ActivityStatus.Confirmed:
          if (subType === 'Upcoming') {
            return true;
          }
          return false;
        case ActivityStatus.Completed:
          return true;
        default:
          return false;
      }
    }
  };

  // Render action button based on status and role
  const renderActionButton = () => {
    if (isDentor) {
      // Dentor buttons
      switch (status) {
        case JobStatus.NewInquiries:
          return (
            <RowComponent style={styles.bottomButtonsContainer}>
              <Button
                title='Decline'
                onPress={() =>
                  confirmDeclineOrCancelBid('Decline', 'Are you sure you want to decline this job?')
                }
                loading={actionLoading === 'decline'}
                loaderColor={COLORS.TEXT}
                style={[styles.bottomButton, styles.outlineButton]}
                textStyle={styles.outlineButtonText}
              />
              <Button
                title='Bid'
                onPress={handleBidAction}
                style={[styles.bottomButton, styles.primaryButton]}
                textStyle={styles.primaryButtonText}
              />
            </RowComponent>
          );

        case JobStatus.BidPlaced:
          return (
            <RowComponent style={styles.bottomButtonsContainer}>
              <Button
                title='Cancel'
                onPress={() =>
                  confirmDeclineOrCancelBid(
                    'Cancel Bid',
                    'Are you sure you want to cancel your bid?',
                    'cancel',
                  )
                }
                loading={actionLoading === 'cancel'}
                loaderColor={COLORS.TEXT}
                style={[styles.bottomButton, styles.outlineButton]}
                textStyle={styles.outlineButtonText}
              />
              <Button
                title='Edit Bid'
                onPress={() => setIsEditBidModalVisible(true)}
                style={[styles.bottomButton, styles.primaryButton]}
                textStyle={styles.primaryButtonText}
              />
            </RowComponent>
          );

        case JobStatus.Confirmed:
          if (subType === 'Upcoming') {
            return (
              <RowComponent style={styles.bottomButtonsContainer}>
                <Button
                  title='Cancel'
                  onPress={confirmDentorCancelJob}
                  loading={actionLoading === 'cancelJob'}
                  loaderColor={COLORS.TEXT}
                  style={[styles.bottomButton, styles.outlineButton]}
                  textStyle={styles.outlineButtonText}
                />
                <Button
                  title='Start Job'
                  onPress={handleStartJob}
                  loading={actionLoading === 'start'}
                  style={[styles.bottomButton, styles.primaryButton]}
                  textStyle={styles.primaryButtonText}
                />
              </RowComponent>
            );
          }
          if (subType === 'In-Progress') {
            const statusOfAssignment = jobData?.booking_assignments?.[0]?.status;
            const isInProgress = statusOfAssignment == 'in_progress';
            return (
              <RowComponent style={styles.bottomButtonsContainer}>
                {/* <Button
                  title='Cancel'
                  onPress={confirmDentorCancelJob}
                  loading={actionLoading === 'cancelJob'}
                  loaderColor={COLORS.TEXT}
                  style={[styles.bottomButton, styles.outlineButton]}
                  textStyle={styles.outlineButtonText}
                /> */}
                <Button
                  title={isInProgress ? 'Submitted' : 'Mark As Completed'}
                  disabled={isInProgress}
                  onPress={handleCompleteJob}
                  loading={actionLoading === 'complete'}
                  style={[styles.bottomButton, styles.primaryButton]}
                  textStyle={styles.primaryButtonText}
                />
              </RowComponent>
            );
          }
          // if (subType === 'Rejected') {
          //   return (
          //     <Button
          //       title="Re Add Proof Of Verification"
          //       onPress={() => navigate(SCREENS.PROOF_OF_VERIFICATION, { isEditable: true, bookingId: jobData?.id })}
          //       style={[styles.actionButton, styles.secondaryButton]}
          //     />
          //   );
          // }
          return null;

        case JobStatus.Completed:
          return jobData?.review ? (
            <Button title='View Review' onPress={handleViewReview} style={styles.actionButton} />
          ) : (
            <Button
              title='Done'
              onPress={() => navigate(SCREENS.BOTTOM_STACK)}
              style={styles.actionButton}
            />
          );

        default:
          return null;
      }
    } else {
      // User buttons
      switch (status) {
        case ActivityStatus.Requested:
          return (
            <Button
              title='Done'
              onPress={() => navigate(SCREENS.BOTTOM_STACK)}
              loading={actionLoading === 'cancelBooking'}
              loaderColor={COLORS.BACKGROUND}
              style={[styles.bottomButton]}
              textStyle={styles.cancelButtonText}
            />
          );

        case ActivityStatus.Confirmed:
          if (subType === 'Upcoming') {
            return (
              <Button
                title='Done'
                onPress={() => navigate(SCREENS.BOTTOM_STACK)}
                loading={actionLoading === 'cancelBooking'}
                loaderColor={COLORS.BACKGROUND}
                style={[styles.actionButton]}
                textStyle={styles.cancelButtonText}
              />
            );
          }
          // if (subType === 'In-Progress') {
          //   return (
          //     <Button
          //       title="View Proof Of Verification"
          //       onPress={() => setIsVerificationModalVisible(true)}
          //       style={styles.actionButton}
          //     />
          //   );
          // }
          return null;

        case ActivityStatus.Completed:
          return (
            <View style={styles.completedActionsRow}>
              {jobData?.review ? (
                <Button
                  title='View Review'
                  onPress={handleViewReview}
                  style={[styles.actionButton]}
                />
              ) : (
                <Button
                  title='Add Review'
                  onPress={handleAddReview}
                  style={[styles.actionButton]}
                />
              )}
              <Button
                title='Give Tip'
                onPress={handleGiveTip}
                style={[styles.actionButton, styles.secondaryActionButton]}
                textStyle={styles.secondaryActionButtonText}
              />
            </View>
          );

        case ActivityStatus.Cancelled:
          return null;

        default:
          return null;
      }
    }
  };

  return (
    <>
      <Wrapper useScrollView={false} showBackButton={false}>
        <View style={styles.headerContainer}>
          <Header
            title={'Job Detail'}
            showBackButton={true}
            endIcon={() => {
              if (
                status === ActivityStatus.Requested ||
                (status === ActivityStatus.Confirmed && subType === 'Upcoming')
              ) {
                return (
                  <Icon
                    componentName={VARIABLES.MaterialCommunityIcons}
                    iconName='book-cancel-outline'
                    size={26}
                    color={COLORS.PRIMARY}
                    onPress={confirmCancelBooking}
                  />
                );
              }

              return null;
            }}
          />
          {/* Status Badge */}
        </View>
        <ScrollView
          style={[styles.container, hasActionButton() && styles.containerWithButton]}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <JobDetailSkeleton />
          ) : (
            <>
              {/* Main Car Image */}
              <View
                style={{
                  marginBottom: 20,
                  ...STYLES.SHADOW,
                  backgroundColor: COLORS.SURFACE,
                  borderBottomEndRadius: 30,
                  borderBottomStartRadius: 30,
                }}
              >
                <View style={styles.mainImageContainer}>
                  <Photo
                    source={jobData?.media?.[0]?.media_url}
                    imageStyle={styles.mainImage}
                    containerStyle={styles.mainImageContainer}
                    resizeMode='contain'
                    fullScreenImages={
                      (jobData?.media?.map(m => m?.media_url).filter(Boolean) as string[]) ?? []
                    }
                    fullScreenInitialIndex={0}
                  />
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor() }]}>
                    <Typography style={styles.statusBadgeText} fontWeight={FontWeight.SemiBold}>
                      {`${status == 'Bid Placed' ? `Bid Placed: ${jobData?.quotations?.[0]?.amount ?? 0}` : subType === 'Quote Pending' ? 'Pending' : status}`}
                    </Typography>
                  </View>
                </View>

                {/* Damage Type */}
                {jobData?.service_type?.name && (
                  <View style={styles.damageTypeContainer}>
                    <Typography
                      style={styles.damageTypeText}
                      fontSize={FontSize.Large}
                      fontWeight={FontWeight.Bold}
                    >
                      {`Damage Type - ${jobData?.service_type?.name ?? ''}`}
                    </Typography>
                  </View>
                )}

                {/* Thumbnail Images */}
                <RowComponent style={styles.thumbnailContainer}>
                  {jobData?.media?.slice(1).map((image, index) => {
                    const allUrls =
                      (jobData?.media?.map(m => m?.media_url).filter(Boolean) as string[]) ?? [];
                    return (
                      <Photo
                        key={index}
                        source={image?.media_url}
                        imageStyle={styles.thumbnail}
                        containerStyle={styles.thumbnailWrapper}
                        resizeMode='cover'
                        fullScreenImages={allUrls}
                        fullScreenInitialIndex={index + 1}
                      />
                    );
                  })}
                </RowComponent>
              </View>

              {/* Bids Received Section - For Users with Requested status */}
              {!isDentor && status === ActivityStatus.Requested && subType === 'Bids Received' && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleViewBids}
                  style={styles.bidsReceivedCardEnhanced}
                >
                  <RowComponent style={styles.bidsReceivedRow}>
                    <Typography
                      style={styles.bidsReceivedTitle}
                      fontSize={FontSize.MediumLarge}
                      fontWeight={FontWeight.Bold}
                    >
                      {`Bids Received (${jobData?.quotations_count ?? 0})`}
                    </Typography>

                    <RowComponent style={{ alignItems: 'center', gap: 5 }}>
                      <Typography style={styles.viewAllTextEnhanced}>View All</Typography>
                      <Icon
                        componentName={VARIABLES.MaterialIcons}
                        iconName='arrow-forward-ios'
                        size={14}
                        color={COLORS.PRIMARY}
                      />
                    </RowComponent>
                  </RowComponent>
                </TouchableOpacity>
              )}

              {/* Customer / Service Provider Card */}
              {(status === JobStatus.Confirmed || status == ActivityStatus.Confirmed) && (
                <View style={styles.customerCard}>
                  <RowComponent style={styles.customerRow}>
                    <Photo
                      source={otherPerson?.profile_image}
                      imageStyle={styles.customerImage}
                      size={50}
                      borderRadius={25}
                    />
                    <View style={styles.customerInfo}>
                      <Typography style={styles.customerLabel}>
                        {role == 'dentor' ? 'Customer' : 'Service Provider'}
                      </Typography>
                      <Typography
                        style={styles.customerName}
                        fontSize={FontSize.MediumLarge}
                        fontWeight={FontWeight.Bold}
                      >
                        {otherPerson?.full_name ||
                          [otherPerson?.first_name, otherPerson?.last_name]
                            .filter(Boolean)
                            .join(' ') ||
                          (role === APP_CONFIG.PROVIDER_ROLE ? 'Customer' : 'Service Provider')}
                      </Typography>
                    </View>
                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={handleChatPress}
                      activeOpacity={0.7}
                    >
                      <Icon
                        componentName={VARIABLES.MaterialIcons}
                        iconName='chat'
                        size={20}
                        color={COLORS.WHITE}
                      />
                    </TouchableOpacity>
                  </RowComponent>
                </View>
              )}

              {/* View Proof Of Verification Button for In-Progress */}
              {!isDentor && status === ActivityStatus.Confirmed && subType === 'In-Progress' && (
                <View style={styles.proofButtonContainer}>
                  <Button
                    title={
                      jobData?.booking_assignments?.[0]?.status == 'upcoming'
                        ? 'Proof Of Verification (Pending)'
                        : 'View Proof Of Verification'
                    }
                    onPress={() => {
                      if (jobData?.booking_assignments?.[0]?.status == 'upcoming') {
                        return;
                      }
                      navigate(SCREENS.PROOF_OF_VERIFICATION, {
                        isEditable: false,
                        bookingId: jobData?.id,
                      });
                    }}
                    disabled={jobData?.booking_assignments?.[0]?.status == 'upcoming'}
                    style={styles.proofButton}
                    textStyle={styles.proofButtonText}
                  />
                </View>
              )}

              {/* Details Section */}
              <View style={styles.detailsCard}>
                <Typography
                  style={styles.detailsTitle}
                  fontSize={FontSize.Large}
                  fontWeight={FontWeight.Bold}
                >
                  Details
                </Typography>

                <View style={styles.detailRow}>
                  <Typography
                    style={styles.detailLabel}
                    fontSize={FontSize.MediumSmall}
                    color={COLORS.TEXT_SECONDARY}
                  >
                    Vehicle Make & Model:
                  </Typography>
                  <Typography
                    style={styles.detailValue}
                    fontSize={FontSize.MediumSmall}
                    fontWeight={FontWeight.Medium}
                  >
                    {jobData?.vehicle_make}
                  </Typography>
                </View>

                <View style={styles.detailRow}>
                  <Typography
                    style={styles.detailLabel}
                    fontSize={FontSize.MediumSmall}
                    color={COLORS.TEXT_SECONDARY}
                  >
                    Vehicle Year:
                  </Typography>
                  <Typography
                    style={styles.detailValue}
                    fontSize={FontSize.MediumSmall}
                    fontWeight={FontWeight.Medium}
                  >
                    {jobData?.vehicle_year}
                  </Typography>
                </View>

                <View style={styles.detailRow}>
                  <Typography
                    style={styles.detailLabel}
                    fontSize={FontSize.MediumSmall}
                    color={COLORS.TEXT_SECONDARY}
                  >
                    Service Type:
                  </Typography>
                  <Typography
                    style={styles.detailValue}
                    fontSize={FontSize.MediumSmall}
                    fontWeight={FontWeight.Medium}
                  >
                    {jobData?.service?.name}
                  </Typography>
                </View>
                <View style={styles.detailRow}>
                  <Typography
                    style={styles.detailLabel}
                    fontSize={FontSize.MediumSmall}
                    color={COLORS.TEXT_SECONDARY}
                  >
                    Damage Type:
                  </Typography>
                  <Typography
                    style={styles.detailValue}
                    fontSize={FontSize.MediumSmall}
                    fontWeight={FontWeight.Medium}
                  >
                    {jobData?.service_type?.name}
                  </Typography>
                </View>

                {/* <View style={styles.detailRow}>
              <Typography
                style={styles.detailLabel}
                fontSize={FontSize.MediumSmall}
                color={COLORS.TEXT_SECONDARY}
              >
                Pick-up Date:
              </Typography>
              <Typography
                style={styles.detailValue}
                fontSize={FontSize.MediumSmall}
                fontWeight={FontWeight.Medium}
              >
                {jobData.pickupDate}
              </Typography>
            </View> */}

                {/* <View style={styles.detailRow}>
              <Typography
                style={styles.detailLabel}
                fontSize={FontSize.MediumSmall}
                color={COLORS.TEXT_SECONDARY}
              >
                Pick-Up Location:
              </Typography>
              <Typography
                style={styles.detailValue}
                fontSize={FontSize.MediumSmall}
                fontWeight={FontWeight.Medium}
              >
                {jobData.pickupLocation}
              </Typography>
            </View> */}

                {jobData?.drop_off_address && (
                  <View style={styles.detailRow}>
                    <Typography
                      style={styles.detailLabel}
                      fontSize={FontSize.MediumSmall}
                      translate={false}
                      color={COLORS.TEXT_SECONDARY}
                    >
                      {jobData?.service?.type == 'inhouse' ? 'Drop-off Location:' : 'Address:'}
                    </Typography>
                    <Typography
                      style={styles.detailValue}
                      fontSize={FontSize.MediumSmall}
                      fontWeight={FontWeight.Medium}
                    >
                      {safeString(jobData?.drop_off_address)}
                    </Typography>
                  </View>
                )}

                <View style={styles.notesRow}>
                  <Typography
                    style={styles.detailLabel}
                    fontSize={FontSize.MediumSmall}
                    color={COLORS.TEXT_SECONDARY}
                  >
                    Additional Notes:
                  </Typography>
                  <Typography style={styles.notesValue} fontSize={FontSize.MediumSmall}>
                    {jobData?.additional_notes}
                  </Typography>
                </View>
              </View>

              {proofOfVerificationAfterUrl && (
                <View style={styles.proofCard}>
                  <Typography
                    style={styles.proofTitle}
                    fontSize={FontSize.Large}
                    fontWeight={FontWeight.Bold}
                  >
                    Proof Of Verification
                  </Typography>

                  <Photo
                    source={proofOfVerificationAfterUrl}
                    containerStyle={styles.proofImageWrapper}
                    imageStyle={styles.proofImage}
                    resizeMode='cover'
                    fullScreenImages={[proofOfVerificationAfterUrl]}
                    fullScreenInitialIndex={0}
                  />
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Bid Modal */}
      </Wrapper>
      {jobData?.id != null && hasActionButton() && !isLoading ? (
        <View
          style={{
            bottom: insetBottom + 20,
            width: '100%',
            backgroundColor: COLORS.BACKGROUND,
            paddingVertical: 5,
          }}
        >
          {renderActionButton()}
        </View>
      ) : null}
      <BidModal
        isVisible={isBidModalVisible}
        setIsVisible={setIsBidModalVisible}
        item={jobData ?? ({} as Booking)}
        isEdit={false}
        onConfirm={async data => {
          if (!jobData?.id) return;
          const amount = parseFloat(data.bidAmount);
          const res = await createQuotation({
            booking_id: jobData.id,
            amount,
            drop_off_address: data.dropOffAddress,
            drop_off_latitude: data.dropOffLatitude,
            drop_off_longitude: data.dropOffLongitude,
          });
          if (res) {
            setIsBidModalVisible(false);
            onBack();
          }
        }}
      />

      {/* Edit Bid Modal */}
      <BidModal
        isVisible={isEditBidModalVisible}
        setIsVisible={setIsEditBidModalVisible}
        item={jobData ?? ({} as Booking)}
        isEdit={true}
        onConfirm={async data => {
          if (!jobData?.id || !jobData?.quotations?.[0]?.id) return;
          const amount = parseFloat(data.bidAmount);
          const res = await updateQuotation({
            quotation_id: jobData?.quotations?.[0]?.id,
            booking_id: jobData.id,
            amount,
            drop_off_address: data.dropOffAddress,
            drop_off_latitude: data.dropOffLatitude,
            drop_off_longitude: data.dropOffLongitude,
          });
          if (res) {
            setIsEditBidModalVisible(false);
            onBack();
          }
        }}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isVisible={isReviewsModalVisible}
        setIsVisible={setIsReviewsModalVisible}
        item={jobData ?? ({} as Booking)}
      />

      {/* Verification Picture Modal */}
      <VerificationPictureModal
        isVisible={isVerificationModalVisible}
        setIsVisible={setIsVerificationModalVisible}
        item={jobData ?? ({} as Booking)}
        onConfirm={async image => {
          if (!jobData?.id) return;
          const res = await submitProofOfVerification({
            booking_id: jobData.id,
            proof_of_work: [
              { label: 'before', media: image },
              { label: 'after', media: image },
            ],
          });
          if (res) {
            const userId = jobData.user_id ?? jobData.user?.id;
            const dentorId = getDentorFromBooking(jobData, undefined)?.id;
            if (userId != null && dentorId != null && jobData?.id) {
              markConversationCompleted(String(userId), String(dentorId), String(jobData.id)).catch(
                () => {},
              );
            }
            setIsVerificationModalVisible(false);
            onBack();
          }
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    marginTop: 10,
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 0,
    paddingVertical: 10,
    paddingRight: 25,
    paddingLeft: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    zIndex: 10,
  },
  statusBadgeText: {
    color: COLORS.WHITE,
    textTransform: 'capitalize',
    // fontSize:
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  containerWithButton: {
    marginBottom: 30,
  },
  mainImageContainer: {
    width: '100%',
    height: screenHeight(30),
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  damageTypeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  damageTypeText: {
    textAlign: 'center',
  },
  thumbnailContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
    justifyContent: 'center',
  },
  thumbnailWrapper: {
    width: screenWidth(20),
    height: screenWidth(20),
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  customerCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  customerRow: {
    alignItems: 'center',
    gap: 15,
  },
  customerImage: {
    borderRadius: 25,
    backgroundColor: COLORS.WHITE,
  },
  customerInfo: {
    flex: 1,
    // gap: 5,
  },
  customerLabel: {
    // textTransform: 'uppercase',
    fontWeight: FontWeight.SemiBold,
  },
  customerName: {
    textTransform: 'capitalize',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  detailsTitle: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    flex: 1,
  },
  notesRow: {
    marginTop: 10,
    gap: 10,
  },
  notesValue: {
    lineHeight: 20,
  },
  actionButton: {
    marginHorizontal: 20,
  },
  completedActionsRow: {
    gap: 10,
    marginHorizontal: 20,
  },
  secondaryActionButton: {
    backgroundColor: COLORS.TEXT,
  },
  secondaryActionButtonText: {
    color: COLORS.BACKGROUND,
  },
  cancelButton: {
    backgroundColor: COLORS.RED,
    marginHorizontal: 30,
  },
  cancelButtonText: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
  secondaryButton: {
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  bidsReceivedCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  bidsReceivedRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidsReceivedTitle: {
    flex: 1,
  },
  viewAllText: {},
  bottomButtonsContainer: {
    marginHorizontal: 20,
    gap: 10,
    justifyContent: 'space-between',
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    width: '86%',
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.TEXT,
  },
  primaryButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
  outlineButton: {
    backgroundColor: COLORS.TRANSPARENT,
    borderWidth: 1,
    borderColor: COLORS.TEXT,
  },
  outlineButtonText: {
    color: COLORS.TEXT,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
  bottomButtonText: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
  proofButtonContainer: {
    marginHorizontal: 20,
    width: screenWidth(80),
    alignSelf: 'center',
    marginVertical: 12,
  },
  proofButton: {
    backgroundColor: COLORS.TEXT,
  },
  proofButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
  },
  proofCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  proofTitle: {
    marginBottom: 8,
  },
  proofLabel: {
    marginBottom: 12,
  },
  proofImageWrapper: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  proofImage: {
    width: '100%',
    height: screenHeight(25),
    borderRadius: 15,
  },
  bidsReceivedCardEnhanced: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 18,
    borderRadius: 15,
    ...STYLES.SHADOW,
    backgroundColor: '#FFF7ED',
    // backgroundColor: COLORS.SURFACE,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },

  viewAllTextEnhanced: {
    color: COLORS.PRIMARY,
    fontWeight: FontWeight.SemiBold,
  },
});
