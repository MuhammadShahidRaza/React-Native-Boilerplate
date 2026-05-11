import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Button, Icon, Wrapper } from 'components/index';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { COLORS, STYLES, screenHeight, screenWidth, showToast } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import { ImageUpload } from 'components/common/ImageUpload';
import { SelectedMedia, useMediaPicker } from 'hooks/useMediaPicker';
import { openCameraOrGallery } from 'utils/helpers/functions';
import { onBack } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { AppScreenProps } from 'types/navigation';
import { IMAGES } from 'constants/assets';
import { submitProofOfVerification, getBookingDetailsById } from 'api/functions/app/home';
import { useAppSelector } from 'types/reduxTypes';
import type { AssignmentAttemptMedia } from 'types/responseTypes';
import { markConversationCompleted } from '../../services/chat/firestoreChat';
import { isWorkerRole } from 'config/app';
import { getDentorFromBooking } from 'utils/helpers/functions';

const ProofOfVerificationSkeleton = () => (
  <View style={skeletonStyles.container}>
    {/* <View style={skeletonStyles.section}>
      <SkeletonPlaceholder borderRadius={8} backgroundColor={COLORS.SKELETON_BACKGROUND} highlightColor={COLORS.SKELETON_HIGHLIGHT}>
        <SkeletonPlaceholder.Item width={screenWidth(25)} height={22} borderRadius={6} marginBottom={15} />
      </SkeletonPlaceholder>
      <View style={skeletonStyles.imageContainer}>
        <SkeletonPlaceholder borderRadius={15} backgroundColor={COLORS.SKELETON_BACKGROUND} highlightColor={COLORS.SKELETON_HIGHLIGHT}>
          <SkeletonPlaceholder.Item width={screenWidth(90)} height={screenHeight(25)} borderRadius={15} />
        </SkeletonPlaceholder>
      </View>
    </View> */}
    <View style={skeletonStyles.section}>
      <SkeletonPlaceholder
        borderRadius={8}
        backgroundColor={COLORS.SKELETON_BACKGROUND}
        highlightColor={COLORS.SKELETON_HIGHLIGHT}
      >
        <SkeletonPlaceholder.Item
          width={screenWidth(25)}
          height={22}
          borderRadius={6}
          marginBottom={15}
        />
      </SkeletonPlaceholder>
      <View style={skeletonStyles.imageContainer}>
        <SkeletonPlaceholder
          borderRadius={15}
          backgroundColor={COLORS.SKELETON_BACKGROUND}
          highlightColor={COLORS.SKELETON_HIGHLIGHT}
        >
          <SkeletonPlaceholder.Item
            width={screenWidth(90)}
            height={screenHeight(25)}
            borderRadius={15}
          />
        </SkeletonPlaceholder>
      </View>
    </View>
    <View style={skeletonStyles.buttonRow}>
      <SkeletonPlaceholder
        borderRadius={12}
        backgroundColor={COLORS.SKELETON_BACKGROUND}
        highlightColor={COLORS.SKELETON_HIGHLIGHT}
      >
        <SkeletonPlaceholder.Item
          width={screenWidth(80)}
          height={50}
          borderRadius={12}
          marginHorizontal={20}
        />
      </SkeletonPlaceholder>
    </View>
  </View>
);

/** Get first assignment attempt's media from booking */
const getFirstAttemptMedia = (
  booking: {
    booking_assignments?: Array<{
      assignment_attempts?: Array<{ media?: AssignmentAttemptMedia[] }>;
    }>;
  } | null,
): AssignmentAttemptMedia[] => {
  const attempts = booking?.booking_assignments?.[0]?.assignment_attempts;
  if (!attempts?.length) return [];
  const first = attempts?.[0];
  return first?.media ?? [];
};

export const ProofOfVerification = ({
  route,
}: AppScreenProps<typeof SCREENS.PROOF_OF_VERIFICATION>) => {
  const isEditable = route?.params?.isEditable ?? true;
  const bookingId = route?.params?.bookingId;
  const role = useAppSelector(state => state?.user?.role);
  const currentUserId = useAppSelector(state => state?.user?.userDetails?.id);
  const isDentor = isWorkerRole(role);

  const [afterImage, setAfterImage] = useState<SelectedMedia | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProof, setLoadingProof] = useState(false);
  const [proofMedia, setProofMedia] = useState<AssignmentAttemptMedia[]>([]);
  const { pickMedia } = useMediaPicker();

  const fetchProofImages = useCallback(async () => {
    if (!bookingId) return;
    setLoadingProof(true);
    try {
      const booking = await getBookingDetailsById({ id: String(bookingId), isDentor });
      const media = getFirstAttemptMedia(booking);

      setProofMedia(media);
    } finally {
      setLoadingProof(false);
    }
  }, [bookingId, isDentor]);

  useEffect(() => {
    fetchProofImages();
  }, [fetchProofImages]);

  const handleEditAfter = () => {
    openCameraOrGallery({
      cameraPress: () => {
        pickMedia({
          mediaType: 'image',
          source: 'camera',
          cropping: false,
        }).then(media => {
          if (media && media.length > 0) {
            setAfterImage(media?.[0] ?? null);
          }
        });
      },
      galleryPress: () => {
        pickMedia({
          mediaType: 'image',
          source: 'gallery',
          cropping: false,
        }).then(media => {
          if (media && media.length > 0) {
            setAfterImage(media?.[0] ?? null);
          }
        });
      },
    });
  };

  const handleResubmit = async () => {
    if (!bookingId) {
      showToast({ message: 'Booking not found', isError: true });
      return;
    }
    if (!afterImage) {
      showToast({ message: 'Please upload After image', isError: true });
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitProofOfVerification({
        booking_id: bookingId,
        proof_of_work: [
          // { label: 'before', media: beforeImage },
          { label: 'after', media: afterImage },
        ],
      });
      if (res) {
        showToast({ message: 'Proof submitted successfully', isError: false });
        const booking = await getBookingDetailsById({ id: String(bookingId), isDentor });
        const customerId = booking?.user_id ?? booking?.user?.id;
        const dentorId =
          isDentor ? currentUserId : getDentorFromBooking(booking ?? null, undefined)?.id;
        if (customerId != null && dentorId != null) {
          await markConversationCompleted(
            String(customerId),
            String(dentorId),
            String(bookingId),
          ).catch(() => {});
        }
        onBack();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // console.log(bookingId);

  // const handleApprove = async () => {
  //   if (!bookingId) {
  //     showToast({ message: 'Booking not found', isError: true });
  //     return;
  //   }
  //   setActionLoading('approve');
  //   try {
  //     const res = await approveWork({ booking_id: bookingId, status: 'accepted' });
  //     if (res) {
  //       showToast({ message: 'Work approved', isError: false });
  //       onBack();
  //     }
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // const handleDisapprove = async () => {
  //   if (!bookingId) {
  //     showToast({ message: 'Booking not found', isError: true });
  //     return;
  //   }
  //   setActionLoading('disapprove');
  //   try {
  //     const res = await approveWork({ booking_id: bookingId, status: 'rejected' });
  //     if (res) {
  //       showToast({ message: 'Work rejected', isError: false });
  //       onBack();
  //     }
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // const beforeMediaUrl = proofMedia?.[0]?.media_url ?? null;
  const afterMediaUrl = proofMedia?.[0]?.media_url ?? null;
  // const beforeDisplay = beforeImage?.uri ?? beforeMediaUrl;
  const afterDisplay = afterImage?.uri ?? afterMediaUrl;
  const proofImageUrls = [afterDisplay].filter(Boolean) as string[];

  if (loadingProof) {
    return (
      <Wrapper useScrollView={true} headerTitle='Proof Of Verification'>
        <ProofOfVerificationSkeleton />
      </Wrapper>
    );
  }

  return (
    <Wrapper useScrollView={true} headerTitle='Proof Of Verification'>
      <View style={styles.container}>
        {/* Before Section */}
        {/* <View style={styles.section}>
          <Typography
            style={styles.sectionTitle}
            fontSize={FontSize.Large}
            fontWeight={FontWeight.Bold}
          >
            Before
          </Typography>
          <View style={styles.imageContainer}>
            <View style={styles.placeholderContainer}>
              <ImageUpload
                label='Upload Before Image'
                onImageSelected={setBeforeImage}
                selectedImage={beforeImage?.uri ?? beforeMediaUrl ?? IMAGES.BOX_CAR}
                disabled={!isEditable}
                height={screenHeight(25)}
                showReplaceRemoveOptions={false}
                width={screenWidth(90)}
                fullScreenImages={!isEditable && proofImageUrls.length > 0 ? proofImageUrls : undefined}
                fullScreenInitialIndex={0}
              />
            </View>
            {isEditable && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditBefore}
                activeOpacity={0.7}
              >
                <Icon
                  componentName={VARIABLES.MaterialIcons}
                  iconName='edit'
                  size={20}
                  color={COLORS.WHITE}
                />
              </TouchableOpacity>
            )}
          </View>
        </View> */}

        {/* After Section */}
        <View style={styles.section}>
          <Typography
            style={styles.sectionTitle}
            fontSize={FontSize.Large}
            fontWeight={FontWeight.Bold}
          >
            After
          </Typography>
          <View style={styles.imageContainer}>
            <View style={styles.placeholderContainer}>
              <ImageUpload
                label='Upload After Image'
                onImageSelected={setAfterImage}
                selectedImage={afterImage?.uri ?? afterMediaUrl ?? IMAGES.BOX_CAR}
                disabled={!isEditable}
                height={screenHeight(25)}
                showReplaceRemoveOptions={false}
                width={screenWidth(90)}
                fullScreenImages={
                  !isEditable && proofImageUrls.length > 0 ? proofImageUrls : undefined
                }
                fullScreenInitialIndex={1}
              />
            </View>
            {isEditable && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditAfter}
                activeOpacity={0.7}
              >
                <Icon
                  componentName={VARIABLES.MaterialIcons}
                  iconName='edit'
                  size={20}
                  color={COLORS.WHITE}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Submit / Approve / Disapprove Buttons */}
        {isEditable && (
          <Button
            title='Submit'
            onPress={handleResubmit}
            loading={submitting}
            disabled={submitting || !afterImage}
            style={styles.resubmitButton}
          />
        )}
        {/* {!isEditable && (
          <View>
            <Button
              title='Approve'
              onPress={handleApprove}
              loading={actionLoading === 'approve'}
              disabled={!!actionLoading}
              style={[styles.resubmitButton, styles.primaryButton]}
            />
            <Button
              title='Disapprove'
              onPress={handleDisapprove}
              loading={actionLoading === 'disapprove'}
              disabled={!!actionLoading}
              style={[styles.resubmitButton, styles.secondaryButton]}
              textStyle={styles.secondaryButtonText}
            />
          </View>
        )} */}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  image: {
    width: '100%',
    height: screenHeight(25),
    borderRadius: 15,
  },
  placeholderContainer: {
    width: '100%',
    height: screenHeight(25),
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...STYLES.SHADOW,
    backgroundColor: COLORS.PRIMARY,
  },
  resubmitButton: {
    marginTop: 10,
    marginHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.TRANSPARENT,
    borderWidth: 1,
    borderColor: COLORS.TEXT,
  },
  secondaryButtonText: {
    color: COLORS.TEXT,
  },
});

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 0,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  buttonRow: {
    marginTop: 10,
  },
});
