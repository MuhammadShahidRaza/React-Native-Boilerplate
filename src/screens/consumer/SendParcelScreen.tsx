import { useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Button, Typography, Wrapper } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS } from 'utils/index';

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

export const SendParcelScreen = () => {
  const [receiverName, setReceiverName] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [pkg, setPkg] = useState('');

  return (
    <Wrapper
      headerTitle="Send Parcel"
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView
      darkMode={false}
    >
      <Typography style={styles.label}>Pickup & Drop-Off</Typography>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: COLORS.APP_PRIMARY }]} />
          <View style={{ flex: 1 }}>
            <Typography style={styles.mutedSmall}>Pickup location</Typography>
            <TextInput
              style={styles.inlineInput}
              placeholder="Enter pickup"
              placeholderTextColor={COLORS.APP_TEXT_MUTED}
              value={pickup}
              onChangeText={setPickup}
            />
          </View>
        </View>
        <View style={styles.vline} />
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: COLORS.APP_SECONDARY }]} />
          <View style={{ flex: 1 }}>
            <Typography style={styles.mutedSmall}>Drop-off location</Typography>
            <TextInput
              style={styles.inlineInput}
              placeholder="Enter drop-off"
              placeholderTextColor={COLORS.APP_TEXT_MUTED}
              value={dropoff}
              onChangeText={setDropoff}
            />
          </View>
        </View>
      </View>

      <Typography style={styles.label}>Pricing</Typography>
      <View style={styles.priceBox}>
        <Typography style={styles.muted}>Base Fare</Typography>
        <Typography style={styles.price}>CFA 550</Typography>
      </View>

      <Typography style={styles.label}>Sender Details</Typography>
      <TextInput
        style={styles.input}
        placeholder="Sender Name"
        placeholderTextColor={COLORS.APP_TEXT_MUTED}
        value={senderName}
        onChangeText={setSenderName}
      />
      <TextInput
        style={styles.input}
        placeholder="Sender Phone"
        placeholderTextColor={COLORS.APP_TEXT_MUTED}
        value={senderPhone}
        onChangeText={setSenderPhone}
      />

      <Typography style={styles.label}>Receiver Details</Typography>
      <TextInput
        style={[styles.input, receiverName ? styles.inputFocus : null]}
        placeholder="Receiver Name"
        placeholderTextColor={COLORS.APP_TEXT_MUTED}
        value={receiverName}
        onChangeText={setReceiverName}
      />
      <TextInput
        style={styles.input}
        placeholder="Receiver Phone"
        placeholderTextColor={COLORS.APP_TEXT_MUTED}
        value={receiverPhone}
        onChangeText={setReceiverPhone}
      />

      <Typography style={styles.label}>Package Description</Typography>
      <TextInput
        style={[styles.input, styles.area]}
        placeholder="What are you sending?"
        placeholderTextColor={COLORS.APP_TEXT_MUTED}
        multiline
        value={pkg}
        onChangeText={setPkg}
      />

      <Button
        title="Request Courier"
        onPress={() => navigate(SCREENS.SEND_PARCEL_FINDING)}
        style={styles.cta}
        textStyle={styles.ctaText}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
    color: COLORS.APP_TEXT,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 22,
  },
  vline: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.APP_LINE,
    marginLeft: 5,
    marginVertical: 4,
  },
  mutedSmall: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.ExtraSmall,
  },
  inlineInput: {
    fontSize: FontSize.Medium,
    color: COLORS.APP_TEXT,
    paddingVertical: 8,
  },
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  muted: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
  price: {
    color: COLORS.APP_SECONDARY,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Large,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.Medium,
    color: COLORS.APP_TEXT,
    marginBottom: 10,
    backgroundColor: COLORS.WHITE,
  },
  inputFocus: {
    borderColor: COLORS.APP_SECONDARY,
    borderWidth: 2,
  },
  area: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  cta: {
    marginTop: 20,
    backgroundColor: COLORS.APP_SECONDARY,
    borderRadius: 999,
  },
  ctaText: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
  },
});
