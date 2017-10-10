/* @flow */
import connectWithActions from '../connectWithActions';
import { getAuth } from '../selectors';
import SearchMessagesCard from './SearchMessagesCard';

export default connectWithActions(state => ({
  auth: getAuth(state),
}))(SearchMessagesCard);
