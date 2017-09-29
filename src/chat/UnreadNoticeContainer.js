/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getUnreadCountInActiveNarrow } from '../selectors';
import UnreadNotice from './UnreadNotice';

export default connect(
  state => ({
    unreadCount: getUnreadCountInActiveNarrow(state),
  }),
  boundActions,
)(UnreadNotice);
