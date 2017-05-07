import { SETTINGS_CHANGE } from '../actionConstants';

const initialState = {
  locale: 'en',
  theme: 'light',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SETTINGS_CHANGE:
      return {
        ...state,
        [action.key]: action.value,
      };
    default:
      return state;
  }
};
