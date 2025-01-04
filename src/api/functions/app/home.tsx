import {API_ROUTES} from 'api/routes';
import {handleGetApiRequest} from '.';
import {User} from 'types/response';

const getHomeListing = async <R extends {user: User}>() => {
  const data = await handleGetApiRequest<R>(API_ROUTES.HOME);
  console.log(data);

  //   if (user) {
  //     store.dispatch(setUserDetails(user?.user));
  //   }
};

export {getHomeListing};
