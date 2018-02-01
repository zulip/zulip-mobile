/* @flow */
import connectWithActions from '../connectWithActions';
import { getAllRealmEmoji, getAuth, getCurrentRoute, getSubscriptions } from '../selectors';
import SearchMessagesCard from './SearchMessagesCard';

export default connectWithActions(state => ({
  auth: getAuth(state),
  currentRoute: getCurrentRoute(state),
  subscriptions: getSubscriptions(state),
  realmEmoji: getAllRealmEmoji(state),
}))(SearchMessagesCard);
