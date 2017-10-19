/* @flow */
import { getOwnEmail, getUsers, getPresence } from '../selectors';
import connectWithActions from '../connectWithActions';
import UsersCard from './UsersCard';

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  users: getUsers(state),
  presences: getPresence(state),
}))(UsersCard);
