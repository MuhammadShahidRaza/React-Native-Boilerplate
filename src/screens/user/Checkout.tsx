import { StyleSheet, View } from 'react-native';
import { Button, Wrapper } from 'components/index';
import { SCREENS } from 'constants/index';
import { navigate } from 'navigation/index';
import { FontSize, FontWeight } from 'types/index';
import { STYLES } from 'utils/index';
import { renderSubPriceItem } from './Cart';

export const Checkout = () => {
  return (
    <Wrapper useScrollView useSafeArea={false}>
      <View style={styles.container}>
        <View style={styles.subItemContainer}></View>
        <View style={styles.subItemContainer}>
          {renderSubPriceItem({
            title: 'Sub Total',
            value: '100',
            style: styles.subItem,
            titleStyle: styles.heading,
            valueStyle: styles.heading,
          })}
          {renderSubPriceItem({
            title: 'Standard Delivery',
            value: '93',
            style: styles.subItem,
            titleStyle: styles.title,
            valueStyle: styles.title,
          })}
          {renderSubPriceItem({
            title: 'Platform Fee',
            value: '7',
            style: styles.subItem,
            titleStyle: styles.title,
            valueStyle: styles.title,
          })}
        </View>
        <View style={styles.subItemContainer}>
          {renderSubPriceItem({
            title: 'Total (Incl. fees and tax)',
            value: '200',
            style: styles.subItem,
            titleStyle: styles.heading,
            valueStyle: styles.heading,
          })}
        </View>
        <Button
          title={'Confirm Payment'}
          onPress={() => {
            navigate(SCREENS.CHECKOUT);
          }}
          style={styles.button}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  subItemContainer: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 15,
    ...STYLES.SHADOW,
  },
  subItem: {
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: FontSize.MediumSmall,
  },
  heading: {
    fontWeight: FontWeight.SemiBold,
  },
  button: {
    marginVertical: 20,
  },
});
