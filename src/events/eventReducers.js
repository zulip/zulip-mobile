import {
  ACCOUNT_SWITCH,
  EVENT_QUEUE_REGISTERED,
  EVENT_QUEUE_RESTARTED,
  EVENT_QUEUE_SUSPENDED,
  LOGOUT,
} from '../constants';

const initialState = {
  queueId: null,
  lastEventId: null,
  active: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
    case LOGOUT:
      return initialState;
    case EVENT_QUEUE_REGISTERED:
      return {
        ...state,
        queueId: action.queueId,
        lastEventId: action.lastEventId,
        active: true,
      };
    case EVENT_QUEUE_SUSPENDED:
      return {
        ...state,
        active: false,
      };
    case EVENT_QUEUE_RESTARTED:
      return {
        ...state,
        active: true,
      };
    default:
      if (action.lastEventId) {
        return {
          ...state,
          lastEventId: Math.max(state.lastEventId, action.eventId),
        };
      }
      return state;
  }
};
