import {REALM_INIT} from '../constants';

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
    default:
      return state;
  }
};

export default reducer;
