import {
  Button,
  CartItemCard,
  FlatListComponent,
  RowComponent,
  Typography,
  Wrapper,
} from 'components/index';
import { IMAGES, SCREENS } from 'constants/index';
import { reset } from 'navigation/index';
import { useState } from 'react';
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { FontSize, StyleType, FontWeight } from 'types/index';
import { STYLES } from 'utils/index';

export const renderSubPriceItem = ({
  title,
  value,
  style,
  titleStyle,
  valueStyle,
}: {
  title: string;
  value: string;
  style: StyleType;
  titleStyle: StyleProp<TextStyle>;
  valueStyle: StyleProp<TextStyle>;
}) => {
  return (
    <RowComponent style={style}>
      <Typography style={titleStyle}>{title}</Typography>
      <Typography style={valueStyle}>{`$${Number(value)?.toFixed(2)}`}</Typography>
    </RowComponent>
  );
};
export const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([
    {
      image: IMAGES.USER,
      name: 'Product 1',
      type: 'Type 1',
      price: 50,
      quantity: 1,
      id: 1,
    },
    {
      image: IMAGES.USER,
      name: 'Product 2',
      type: 'Type 1',
      price: 25,
      quantity: 2,
      id: 2,
    },
  ]);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <CartItemCard
        key={item.id}
        image={item.image}
        name={item.name}
        type={item.type}
        price={item.price}
        quantity={item.quantity}
        onIncrease={() => {
          setCartItems(
            cartItems.map(itm =>
              item.id === itm.id ? { ...itm, quantity: itm.quantity + 1 } : itm,
            ),
          );
        }}
        onDecrease={() => {
          setCartItems(
            cartItems.map(itm =>
              item.id === itm.id
                ? { ...itm, quantity: itm.quantity > 1 ? itm.quantity - 1 : 1 }
                : itm,
            ),
          );
        }}
        onDelete={() => {
          setCartItems(cartItems.filter(itm => item.id !== itm.id));
        }}
      />
    );
  };

  return (
    <Wrapper useScrollView useSafeArea={false}>
      <FlatListComponent
        data={cartItems}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
      />
      <View style={styles.container}>
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
          title={'Confirm Payment Address'}
          onPress={() => {
            // navigate(SCREENS.CHECKOUT);
            reset(SCREENS.BOTTOM_STACK);
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
