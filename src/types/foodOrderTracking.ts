export type FoodOrderPhase =
  | 'placing_order'
  | 'order_placed'
  | 'order_accepted'
  | 'preparing'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered';

export const FOOD_ORDER_PHASE_INDEX: Record<FoodOrderPhase, number> = {
  placing_order: -1,
  order_placed: 0,
  order_accepted: 0,
  preparing: 0,
  picked_up: 1,
  on_the_way: 2,
  delivered: 3,
};
