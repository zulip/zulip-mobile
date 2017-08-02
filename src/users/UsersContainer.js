/* @flow */
import { connect } from 'react-redux';

import { getOwnEmail, getCurrentRealm, getAllActiveUsersWithStatus } from '../selectors';
import boundActions from '../boundActions';
import UsersCard from './UsersCard';

export default connect(
  state => ({
    ownEmail: getOwnEmail(state),
    realm: getCurrentRealm(state),
    users: getAllActiveUsersWithStatus(state),
  }),
  boundActions,
)(UsersCard);
