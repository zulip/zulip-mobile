import {
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
  ACCOUNT_SWITCH,
} from '../actionConstants';

const initialState = {
  read: {},
  starred: {},
  collapsed: {},
  mentioned: {},
  wildcard_mentioned: {},
  summarize_in_home: {},
  summarize_in_stream: {},
  force_expand: {},
  force_collapse: {},
  has_alert_word: {},
  historical: {},
  is_me_message: {},
};

const addFlagsForMessages = (state, messages, flags) => {
  if (!messages || messages.length === 0 || !flags || flags.length === 0) {
    return state;
  }

  const newState = { ...state };

  flags.forEach(flag => {
    if (!newState[flag]) {
      newState[flag] = {};
    }

    messages.forEach(message => {
      newState[flag][message] = true;
    });
  });

  return newState;
};

const removeFlagForMessages = (state, messages, flag) => {
  const newStateForFlag = { ...(state[flag] || {}) };
  messages.forEach(message => {
    delete newStateForFlag[message];
  });
  return {
    ...state,
    [flag]: newStateForFlag,
  };
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_SUCCESS:
      return action.messages.reduce(
        (newState, msg) => {
          if (msg.flags) {
            msg.flags.forEach(flag => {
              if (newState[flag]) {
                newState[flag][msg.id] = true;
              } else {
                newState[flag] = {
                  [msg.id]: true,
                };
              }
            });
          }
          return newState;
        },
        { ...state },
      );

    case EVENT_NEW_MESSAGE:
      return addFlagsForMessages(state, [action.message.id], action.message.flags);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      if (action.operation === 'add') {
        return addFlagsForMessages(state, action.messages, [action.flag]);
      } else if (action.operation === 'remove') {
        return removeFlagForMessages(state, action.messages, action.flag);
      } else {
        return state;
      }

    case MARK_MESSAGES_READ:
      return addFlagsForMessages(state, action.messageIds, ['read']);

    default:
      return state;
  }
};
