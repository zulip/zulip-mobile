/* @flow */
import connectWithActions from '../connectWithActions';
import { getAuth, getSubscriptions } from '../selectors';
import SearchMessagesCard from './SearchMessagesCard';

export default connectWithActions(state => ({
  auth: getAuth(state),
  subscriptions: getSubscriptions(state),
}))(SearchMessagesCard);
