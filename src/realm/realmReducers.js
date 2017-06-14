import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  SAVE_TOKEN_GCM,
  DELETE_TOKEN_GCM,
} from '../actionConstants';

// Initial state
const initialState = {
  twentyFourHourTime: false,
  gcmToken: '',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case REALM_INIT:
      return {
        ...state,
        twentyFourHourTime: action.data.twenty_four_hour_time,
      };

    case ACCOUNT_SWITCH:
      return initialState;
    case SAVE_TOKEN_GCM: {
      return {
        ...state,
        gcmToken: action.gcmToken
      };
    }
    case DELETE_TOKEN_GCM: {
      return {
        ...state,
        gcmToken: ''
      };
    }
    default:
      return state;
  }
};

export default reducer;
