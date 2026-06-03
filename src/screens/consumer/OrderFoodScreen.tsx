import { Wrapper } from 'components/index';
import { RestaurantBrowseList } from 'components/common/food/RestaurantBrowseList';
import { COLORS } from 'utils/index';

export const OrderFoodScreen = () => (
  <Wrapper
    headerTitle='Order Food'
    showBackButton
    useScrollView={false}
    backgroundColor={COLORS.WHITE}
    darkMode={false}
  >
    <RestaurantBrowseList />
  </Wrapper>
);
