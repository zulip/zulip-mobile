/* @flow */
import { getOwnEmail, getAllActiveUsers, getPresence } from '../selectors';
import connectWithActions from '../connectWithActions';
import GroupCard from './GroupCard';

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  users: getAllActiveUsers(state),
  presences: getPresence(state),
}))(GroupCard);
