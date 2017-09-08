/* @flow */
import { connect } from 'react-redux';

import { getOwnEmail, getAllActiveUsers, getPresence } from '../selectors';
import boundActions from '../boundActions';
import GroupCard from './GroupCard';

export default connect(
  state => ({
    ownEmail: getOwnEmail(state),
    users: getAllActiveUsers(state),
    presences: getPresence(state),
  }),
  boundActions,
)(GroupCard);
