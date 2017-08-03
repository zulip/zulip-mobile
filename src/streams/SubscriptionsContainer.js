/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import type { GlobalState } from '../types';
import { getActiveNarrow, getUnreadByStream } from '../selectors';
import SubscriptionsCard from './SubscriptionsCard';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';

export default connect(
  (state: GlobalState) => ({
    narrow: getActiveNarrow(state),
    subscriptions: getSubscribedStreams(state),
    unreadByStream: getUnreadByStream(state),
  }),
  boundActions,
)(SubscriptionsCard);
