import { combineReducers } from 'redux';
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

export default combineReducers({
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
});
