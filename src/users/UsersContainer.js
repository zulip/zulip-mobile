/* @flow */
import { getOwnEmail, getAllActiveUsers, getPresence } from '../selectors';
import connectWithActions from '../connectWithActions';
import UsersCard from './UsersCard';

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  users: getAllActiveUsers(state),
  presences: getPresence(state),
}))(UsersCard);
