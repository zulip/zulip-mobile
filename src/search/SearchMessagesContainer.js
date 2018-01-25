/* @flow */
import connectWithActions from '../connectWithActions';
import { getAllRealmEmoji, getAuth, getSubscriptions } from '../selectors';
import SearchMessagesCard from './SearchMessagesCard';

export default connectWithActions(state => ({
  auth: getAuth(state),
  subscriptions: getSubscriptions(state),
  realmEmoji: getAllRealmEmoji(state),
}))(SearchMessagesCard);
