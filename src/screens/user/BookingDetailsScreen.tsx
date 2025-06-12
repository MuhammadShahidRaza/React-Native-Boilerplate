// screens/BookingDetailsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Wrapper,
  Typography,
  RowComponent,
  Button,
  ModalComponent,
  Header,
} from 'components/index';
import { COLORS } from 'utils/colors';
import { FontSize } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';

const BookingDetailsScreen = ({ route }: any) => {
  const { booking } = route.params; // assuming booking object passed in route
  const [modalType, setModalType] = useState<'cancel' | 'reschedule' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timer, setTimer] = useState(2); // example: minutes countdown
  console.log(booking, 'Bookingss');
  const handleAction = (action: 'cancel' | 'reschedule') => {
    setModalType(action);
    setShowModal(true);
  };

  const confirmAction = () => {
    if (modalType === 'cancel') {
      // handle cancel logic
    } else {
      // handle reschedule logic
    }
    setShowModal(false);
  };

  return (
    <>
      <Wrapper>
        <View style={{ marginTop: 20 }}>
          <Header title='My Booking' />
        </View>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {/* <View style={styles.container}> */}

          <View style={styles.profileContainer}>
            <Image source={booking.image} style={styles.avatar} resizeMode='cover' />
            <Typography style={styles.name}>{booking.name}</Typography>
            <Typography style={styles.rating}>⭐⭐⭐⭐⭐ {booking.rating}</Typography>
            <Typography style={styles.description}>(51 Reviews)</Typography>
          </View>

          <View style={styles.card}>
            <Image source={IMAGES.ONBOARDING2} style={styles.serviceImage} resizeMode='cover' />
            <View style={{ marginStart: 10, marginTop: 10 }}>
              <Typography style={styles.title}>Service 1</Typography>
              <Typography style={styles.description}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Typography>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <RowComponent style={{ justifyContent: 'space-between' }}>
              <Typography style={styles.detailText}>Booking Status:</Typography>
              {!booking?.status ? (
                <Typography style={styles.detailText}>Pending</Typography>
              ) : (
                <Typography style={styles.detailText}>{booking.status}</Typography>
              )}
            </RowComponent>
            <RowComponent style={{ justifyContent: 'space-between' }}>
              <Typography style={styles.detailText}>Booking Date: </Typography>
              <Typography style={styles.detailText}>MM/DD/YYYY</Typography>
            </RowComponent>
            <RowComponent style={{ justifyContent: 'space-between' }}>
              <Typography style={styles.detailText}>Booking Time Slot: </Typography>
              <Typography style={styles.detailText}>10:00am to 12:00pm</Typography>
            </RowComponent>
            <RowComponent style={{ justifyContent: 'space-between' }}>
              <Typography style={styles.detailText}>Location: </Typography>
              <Typography style={styles.detailText}>Abu Dhabi</Typography>
            </RowComponent>
            <RowComponent style={{ justifyContent: 'space-between' }}>
              <Typography style={styles.detailText}>Booking Code:</Typography>
              <Typography style={styles.detailText}>ABCD123</Typography>
            </RowComponent>
            <RowComponent style={{ justifyContent: 'space-between' }}>
              <Typography style={styles.detailText}>Booking Amount:</Typography>
              <Typography style={styles.detailText}>$100</Typography>
            </RowComponent>
          </View>

          {!booking.status && (
            //   <RowComponent style={styles.actionRow}>
            <View>
              {/* <RowComponent style={styles.actionRow}> */}
              <View style={styles.line} />
              <RowComponent style={{ justifyContent: 'space-between', marginVertical: 26 }}>
                <View style={{ width: 200 }}>
                  <Typography style={{ fontSize: FontSize.MediumLarge, fontWeight: '500' }}>
                    Reschedule Booking:
                  </Typography>
                  <Typography
                    style={{
                      fontSize: FontSize.ExtraSmall,
                      fontWeight: '400',
                      color: COLORS.BOOKING_DESC,
                    }}
                  >
                    Booking can only be rescheduled 12 hours before the service time.
                  </Typography>
                </View>
                <Button
                  title='Reschedule'
                  textStyle={{ fontSize: FontSize.Small, fontWeight: '700' }}
                  onPress={() => handleAction('reschedule')}
                  style={styles.rescheduleBtn}
                />
              </RowComponent>
              <View style={styles.line} />
              <RowComponent style={{ justifyContent: 'space-between', marginVertical: 26 }}>
                <View style={{ flex: 1 }}>
                  <Typography style={{ fontSize: FontSize.MediumLarge, fontWeight: '500' }}>
                    Cancel Booking:
                  </Typography>
                  <Typography
                    style={{
                      fontSize: FontSize.ExtraSmall,
                      fontWeight: '400',
                      color: COLORS.BOOKING_DESC,
                    }}
                  >
                    Booking can be Cancelled within 6 Hours of initiation. After cutoff time penalty
                    fee will be charged.
                  </Typography>
                </View>
                <Button
                  title='Cancel Booking'
                  textStyle={{ fontSize: FontSize.Small, fontWeight: '700' }}
                  onPress={() => handleAction('cancel')}
                  style={styles.cancelBtn}
                />
              </RowComponent>
            </View>
          )}

          {booking.status === 'Active' && (
            <Button title='Start Job' onPress={() => {}} style={styles.primaryBtn} />
          )}

          {booking.status === 'Completed' && (
            <View style={{ marginTop: 20 }}>
              <Typography style={styles.feedBackText}>Give review to service Provider</Typography>
              <Typography style={styles.rating}>⭐⭐⭐⭐⭐</Typography>
              <TextInput
                placeholder='Write your feedback here...'
                value={feedback}
                onChangeText={setFeedback}
                multiline
                style={styles.feedbackBox}
              />
              <Button
                title='Submit'
                onPress={() => {}}
                textStyle={{ fontWeight: '700' }}
                style={styles.primaryBtn}
              />
            </View>
          )}

          {booking.status === 'Active' && timer >= 0 && (
            <View style={styles.timerBox}>
              <Typography style={styles.timerText}>HH:MM</Typography>
              <Typography style={styles.timerValue}>
                0{timer}:0{timer}
              </Typography>
            </View>
          )}
          {/* </View> */}
        </ScrollView>
      </Wrapper>
      <ModalComponent modalVisible={showModal} setModalVisible={setShowModal}>
        <View style={styles.modalContent}>
          <Typography style={styles.modalText}>
            {modalType === 'cancel'
              ? 'Do you really want to cancel this booking?'
              : 'Do you really want to reschedule this booking?'}
          </Typography>

          <RowComponent style={{ justifyContent: 'space-between', marginTop: 20 }}>
            <Button
              title='No'
              onPress={() => setShowModal(false)}
              style={[styles.modalBtn, { backgroundColor: COLORS.ERROR }]}
            />
            <Button
              title='Yes'
              onPress={confirmAction}
              style={[styles.modalBtn, { backgroundColor: COLORS.PRIMARY }]}
            />
          </RowComponent>
        </View>
      </ModalComponent>
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.WHITE, flex: 1 },
  heading: { fontSize: FontSize.Large, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  profileContainer: { alignItems: 'center', marginBottom: 16 },
  avatar: { height: 70, width: 70, borderRadius: 35, marginBottom: 8 },
  name: { fontSize: FontSize.Medium, fontWeight: '700' },
  rating: { fontSize: FontSize.Small, textAlign: 'center', color: COLORS.ORANGE, marginTop: 2 },
  card: { flexDirection: 'row', marginBottom: 16 },
  line: {
    height: 1,
    backgroundColor: COLORS.INPUT_FIELD_TEXT, // or any color you want
    opacity: 0.4, // optional: for subtle look
  },
  serviceImage: { height: 76, width: 76, borderRadius: 10, marginRight: 10 },
  title: { fontWeight: 'bold', fontSize: FontSize.Medium },
  description: { fontSize: FontSize.Small, color: COLORS.ICONS, textAlign: 'left' },
  detailsSection: { marginVertical: 10 },
  detailText: { fontSize: FontSize.Medium, fontWeight: '400', color: '#2C2C2C', marginBottom: 4 },
  feedBackText: {
    fontSize: FontSize.Large,
    textAlign: 'center',
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  bold: { fontWeight: 'bold' },
  actionRow: { justifyContent: 'space-between', marginVertical: 10 },
  rescheduleBtn: { backgroundColor: COLORS.PRIMARY, width: 132 },
  cancelBtn: { backgroundColor: COLORS.PRIMARY, width: 132 },
  primaryBtn: { marginTop: 20, alignSelf: 'center' },
  feedbackBox: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginVertical: 10,
  },
  timerBox: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    borderWidth: 4,
    borderColor: COLORS.BLACK,
    borderRadius: 10,
    width: 300,
    alignSelf: 'center',
  },
  timerText: { fontSize: FontSize.Large, fontWeight: '400' },
  timerValue: { fontSize: FontSize.XL, fontWeight: 'bold' },
  modalContent: { backgroundColor: COLORS.WHITE, padding: 20, borderRadius: 20 },
  modalText: { fontSize: FontSize.Medium, textAlign: 'center' },
  modalBtn: { width: '48%' },
});

export default BookingDetailsScreen;
