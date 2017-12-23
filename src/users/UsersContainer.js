/* @flow */
import { getOwnEmail, getUsers, getValidPresence } from '../selectors';
import connectWithActions from '../connectWithActions';
import UsersCard from './UsersCard';

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  users: getUsers(state),
  presences: getValidPresence(state),
}))(UsersCard);
