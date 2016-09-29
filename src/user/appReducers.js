import { fromJS } from 'immutable';
import { REHYDRATE } from 'redux-persist/constants';

import { LOGIN_SUCCEEDED } from './userActions';

const initialState = fromJS({
  isHydrated: false,
  isLoggedIn: false,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCEEDED:
      return state.merge({
        isLoggedIn: true,
      });
    case REHYDRATE:
      return state.merge({
        isHydrated: true,
      });
    default:
      return state;
  }
};

export default reducer;
