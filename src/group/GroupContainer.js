/* @flow */
import { getOwnEmail, getPresence, getUsersSansMe } from '../selectors';
import connectWithActions from '../connectWithActions';
import GroupCard from './GroupCard';

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  users: getUsersSansMe(state),
  presences: getPresence(state),
}))(GroupCard);
