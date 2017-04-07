import {combineReducers} from 'redux';
import {BATCH_ACTIONS} from './constants';
import account from './account/accountReducers';
import app from './app/appReducers';
import events from './events/eventReducers';
import mute from './mute/muteReducers';
import nav from './nav/navReducers';
import realm from './realm/realmReducers';
import streams from './streamlist/streamsReducers';
import subscriptions from './subscriptions/subscriptionsReducers';
import chat from './chat/chatReducers';
import userlist from './users/userListReducers';

// Thanks to https://twitter.com/dan_abramov/status/656074974533459968?lang=en
const enableBatching = reducer =>
  (state, action) => {
    switch (action.type) {
      case BATCH_ACTIONS:
        return action.actions.reduce(reducer, state);
      default:
        return reducer(state, action);
    }
  };

export default enableBatching(
  combineReducers({
    account,
    app,
    chat,
    events,
    mute,
    nav,
    realm,
    streams,
    subscriptions,
    userlist,
  })
);
