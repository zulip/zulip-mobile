import { EVENT_TYPING_START, EVENT_TYPING_STOP } from '../constants';
import { normalizeRecipientsSansMe } from '../utils/message';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case EVENT_TYPING_START: {
      const normalizedRecipients = normalizeRecipientsSansMe(action.recipients, action.selfEmail);
      return {
        ...state,
        [normalizedRecipients]: action.sender,
      };
    }

    case EVENT_TYPING_STOP: {
      const normalizedRecipients = normalizeRecipientsSansMe(action.recipients, action.selfEmail);
      const newState = { ...state };
      delete newState[normalizedRecipients];
      return newState;
    }

    default:
      return state;
  }
};
