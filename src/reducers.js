import { combineReducers } from 'redux';
import { BATCH_ACTIONS } from './constants';
import accounts from './account/accountReducers';
import app from './app/appReducers';
import events from './events/eventReducers';
import flags from './chat/flagsReducers';
import mute from './mute/muteReducers';
import nav from './nav/navReducers';
import realm from './realm/realmReducers';
import settings from './settings/settingsReducers';
import streams from './streamlist/streamsReducers';
import subscriptions from './subscriptions/subscriptionsReducers';
import chat from './chat/chatReducers';
import users from './users/usersReducers';

// Thanks to https://twitter.com/dan_abramov/status/656074974533459968?lang=en
const enableBatching = (reducer) =>
  (state, action) => {
    switch (action.type) {
      case BATCH_ACTIONS:
        return action.actions.reduce(reducer, state);
      default:
        return reducer(state, action);
    }
  };

export default enableBatching(combineReducers({
  accounts,
  app,
  chat,
  events,
  flags,
  mute,
  nav,
  realm,
  settings,
  streams,
  subscriptions,
  users,
}));
