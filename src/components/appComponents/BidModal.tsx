import { View, StyleSheet, Platform } from 'react-native';
import { ModalComponent } from '../common/Modal';
import { Typography } from '../common/Typography';
import { RowComponent } from '../common/Row';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Autocomplete } from '../common/Autocomplete';
import { useState, useEffect } from 'react';
import { Booking } from 'types/responseTypes';
import { SVG } from 'constants/assets';
import { SvgComponent } from '../common/Svg';
import { VARIABLES } from 'constants/common';

export interface BidSubmitData {
  bidAmount: string;
  dropOffAddress?: string;
  dropOffLatitude?: number;
  dropOffLongitude?: number;
}

interface BidModalProps {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  item: Booking;
  isEdit?: boolean;
  onConfirm: (data: BidSubmitData) => void | Promise<void>;
}

const MINIMUM_BID_AMOUNT = 150;

export const BidModal: React.FC<BidModalProps> = ({
  isVisible,
  setIsVisible,
  item,
  isEdit = false,
  onConfirm,
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [dropOffAddress, setDropOffAddress] = useState('');
  const [dropOffLatitude, setDropOffLatitude] = useState<number | undefined>();
  const [dropOffLongitude, setDropOffLongitude] = useState<number | undefined>();
  const [dropOffError, setDropOffError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when modal closes; pre-fill drop-off from booking if available
  useEffect(() => {
    if (!isVisible) {
      setBidAmount('');
      setError('');
      setDropOffError('');
    } else {
      setDropOffAddress(item?.drop_off_address ?? '');
      const lat = item?.drop_off_latitude ? parseFloat(item.drop_off_latitude) : NaN;
      const lng = item?.drop_off_longitude ? parseFloat(item.drop_off_longitude) : NaN;
      setDropOffLatitude(!isNaN(lat) ? lat : undefined);
      setDropOffLongitude(!isNaN(lng) ? lng : undefined);
    }
  }, [isVisible, item?.drop_off_address, item?.drop_off_latitude, item?.drop_off_longitude]);

  const handleAmountChange = (text: string) => {
    setBidAmount(text);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateBidAmount = (): boolean => {
    const amount = parseFloat(bidAmount.trim());
    if (isNaN(amount) || amount < MINIMUM_BID_AMOUNT) {
      setError(`Minimum bid amount is $${MINIMUM_BID_AMOUNT}`);
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!bidAmount.trim()) {
      setError('Please enter a bid amount');
      return;
    }

    if (!validateBidAmount()) return;

    if (!dropOffAddress?.trim()) {
      setDropOffError('Please enter drop-off location');
      return;
    }
    setDropOffError('');

    setIsSubmitting(true);
    try {
      await onConfirm({
        bidAmount,
        dropOffAddress: dropOffAddress.trim(),
        dropOffLatitude,
        dropOffLongitude,
      });
      setIsVisible(false);
      setBidAmount('');
      setError('');
      setDropOffAddress('');
      setDropOffLatitude(undefined);
      setDropOffLongitude(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBidValid = (): boolean => {
    const amount = parseFloat(bidAmount.trim());
    return !isNaN(amount) && amount >= MINIMUM_BID_AMOUNT && !!dropOffAddress?.trim();
  };

  return (
    <ModalComponent
      modalVisible={isVisible}
      setModalVisible={setIsVisible}
      position='center'
      wantToCloseOnBack={true}
      closeIcon={true}
      scroll={true}
    >
      <View style={styles.container}>
        <SvgComponent Svg={SVG.BID} />
        <Typography style={styles.titleText}>
          {isEdit ? 'Edit Your Bid' : 'Place Your Bid'}
        </Typography>
        <Typography style={styles.subtitleText}>
          {`${[item?.vehicle_make, item?.vehicle_year].filter(Boolean).join(' ') || item?.service?.name || ''} - ${item?.service_type?.name || ''}`}
        </Typography>

        <View style={styles.inputContainer}>
          <Input
            name='bidAmount'
            title='Bid Amount'
            placeholder={`Enter bid amount (Minimum $${MINIMUM_BID_AMOUNT})`}
            value={bidAmount}
            onChangeText={handleAmountChange}
            keyboardType='number-pad'
            maxLength={5}
            error={error}
            touched={!!error}
            startIcon={{
              componentName: VARIABLES.FontAwesome,
              iconName: 'dollar',
              size: FontSize.Medium,
              color: COLORS.ICONS,
            }}
            containerStyle={styles.input}
            autoFocus={Platform.OS === 'android' ? false : true}
          />
          {!error && bidAmount && (
            <Typography style={styles.minimumText}>
              {`Minimum bid: $${MINIMUM_BID_AMOUNT}`}
            </Typography>
          )}
        </View>

        <View style={styles.dropoffContainer}>
          <Autocomplete
            title='Drop-off Location*'
            placeholder='Enter drop-off address'
            value={dropOffAddress}
            setReverseGeocodedAddress={address => {
              if (address?.fullAddress) {
                setDropOffAddress(address.fullAddress);
                setDropOffLatitude(address.latitude);
                setDropOffLongitude(address.longitude);
                setDropOffError('');
              }
            }}
            error={dropOffError}
            touched={!!dropOffError}
          />
        </View>

        <RowComponent style={styles.buttonRow}>
          {/* <Button
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            title='Cancel'
            onPress={() => {
              setIsVisible(false);
              setBidAmount('');
            }}
          /> */}
          <Button
            style={styles.confirmButton}
            textStyle={styles.confirmButtonText}
            title={isEdit ? 'Update Bid' : 'Place Bid'}
            onPress={handleConfirm}
            disabled={!isBidValid()}
            loading={isSubmitting}
          />
        </RowComponent>
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  titleText: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  subtitleText: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginVertical: 10,
  },
  input: {
    marginBottom: 0,
  },
  dropoffContainer: {
    width: '100%',
    marginBottom: 10,
  },
  buttonRow: {
    gap: 15,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
  },
  confirmButton: {
    flex: 1,
    // padding: 12,
    // backgroundColor: COLORS.PRIMARY,
    // borderRadius: 8,
  },
  confirmButtonText: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.WHITE,
    fontSize: FontSize.Medium,
  },
  minimumText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    marginLeft: 4,
  },
});
