/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getActiveNarrow, getUnreadStreamsAndTopics } from '../selectors';
import UnreadStreamsCard from './UnreadStreamsCard';

export default connect(
  state => ({
    narrow: getActiveNarrow(state),
    unreadStreamsAndTopics: getUnreadStreamsAndTopics(state),
  }),
  boundActions,
)(UnreadStreamsCard);
