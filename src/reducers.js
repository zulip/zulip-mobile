import { combineReducers } from 'redux';
import account from './account/accountReducers';
import app from './app/appReducers';
import events from './events/eventReducers';
import messages from './message-list/messagesReducers';
import nav from './nav/navReducers';
import realm from './realm/realmReducers';
import subscriptions from './subscriptions/subscriptionsReducers';
// import chat from './chat/chatReducers';
import userlist from './userlist/userListReducers';

export default combineReducers({
  account,
  app,
//  chat,
  events,
  messages,
  nav,
  realm,
  subscriptions,
  userlist,
});
