export type FoodOrderPhase =
  | 'placing_order'
  | 'order_placed'
  | 'order_accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'delivered';

export const FOOD_ORDER_PHASE_INDEX: Record<FoodOrderPhase, number> = {
  placing_order: -1,
  order_placed: 0,
  order_accepted: 0,
  preparing: 0,
  ready_for_pickup: 1,
  picked_up: 1,
  in_transit: 2,
  delivered: 3,
};
