import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import BOOK_RIDE_SNLIFT from 'assets/svg/services/book-ride.svg';
import SEND_PARCEL_SNLIFT from 'assets/svg/services/send-parcel.svg';
import ORDER_FOOD_SNLIFT from 'assets/svg/services/order-food.svg';
import BOOK_RIDE_SENGO from 'assets/svg/services/sengo/book-ride.svg';
import SEND_PARCEL_SENGO from 'assets/svg/services/sengo/send-parcel.svg';
import ORDER_FOOD_SENGO from 'assets/svg/services/sengo/order-food.svg';
import COUPON_SENGO from 'assets/svg/services/sengo/coupon.svg';
import COUPON_SNLIFT from 'assets/svg/services/coupon.svg';
import { isSengoBrand } from './brandLogo';

export type ServiceIconKey = 'bookRide' | 'sendParcel' | 'orderFood' | 'coupon';

const SNLIFT_SERVICE_ICONS: Record<ServiceIconKey, FC<SvgProps>> = {
  bookRide: BOOK_RIDE_SNLIFT,
  sendParcel: SEND_PARCEL_SNLIFT,
  orderFood: ORDER_FOOD_SNLIFT,
  coupon: COUPON_SNLIFT,
};


const SENGO_SERVICE_ICONS: Record<ServiceIconKey, FC<SvgProps>> = {
  bookRide: BOOK_RIDE_SENGO,
  sendParcel: SEND_PARCEL_SENGO,
  orderFood: ORDER_FOOD_SENGO,
  coupon: COUPON_SENGO,
};

/** Home service tiles — SN Lift blue→green gradient, Sengo gold gradient (in SVG defs). */
export function getServiceIcon(key: ServiceIconKey): FC<SvgProps> {
  return isSengoBrand() ? SENGO_SERVICE_ICONS[key] : SNLIFT_SERVICE_ICONS[key];
}
