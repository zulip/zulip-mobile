import { combineReducers } from 'redux';
import { BATCH_ACTIONS } from './actionConstants';
import accounts from './account/accountReducers';
import app from './app/appReducers';
import chat from './chat/chatReducers';
import events from './events/eventReducers';
import flags from './chat/flagsReducers';
import mute from './mute/muteReducers';
import nav from './nav/navReducers';
import realm from './realm/realmReducers';
import share from './share/shareReducers';
import settings from './settings/settingsReducers';
import streams from './streamlist/streamsReducers';
import subscriptions from './subscriptions/subscriptionsReducers';
import typing from './typing/typingReducers';
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
  share,
  settings,
  streams,
  subscriptions,
  typing,
  users,
}));
