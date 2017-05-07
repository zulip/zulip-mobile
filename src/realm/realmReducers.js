import {
  REALM_INIT,
  ACCOUNT_SWITCH,
} from '../actionConstants';

// Initial state
const initialState = {
  twentyFourHourTime: false,
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

    default:
      return state;
  }
};

export default reducer;
