/* @flow */
import { getOwnEmail, getUsers, getPresence } from '../selectors';
import connectWithActions from '../connectWithActions';
import GroupCard from './GroupCard';

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  users: getUsers(state),
  presences: getPresence(state),
}))(GroupCard);
