import { Wrapper } from 'components/index';
import { RestaurantBrowseList } from 'components/common/food/RestaurantBrowseList';
import { COLORS } from 'utils/index';

/** Settings → Favorites — same restaurant list UI as Order Food, filtered to hearted items. */
export const Favorites = () => (
  <Wrapper
    headerTitle='Favorites'
    showBackButton
    useScrollView={false}
    backgroundColor={COLORS.WHITE}
    darkMode={false}
  >
    <RestaurantBrowseList favoritesOnly />
  </Wrapper>
);
