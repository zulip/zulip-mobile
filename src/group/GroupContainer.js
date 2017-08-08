/* @flow */
import { connect } from 'react-redux';

import { getOwnEmail, getAllActiveUsersWithStatus } from '../selectors';
import boundActions from '../boundActions';
import GroupCard from './GroupCard';

export default connect(
  state => ({
    ownEmail: getOwnEmail(state),
    users: getAllActiveUsersWithStatus(state),
  }),
  boundActions,
)(GroupCard);
