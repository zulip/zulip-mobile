/* @flow */
import connectWithActions from '../connectWithActions';
import type { GlobalState } from '../types';
import { getActiveNarrow, getUnreadByStream, getAuth } from '../selectors';
import SubscriptionsCard from './SubscriptionsCard';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';

export default connectWithActions((state: GlobalState) => ({
  auth: getAuth(state),
  narrow: getActiveNarrow(state),
  subscriptions: getSubscribedStreams(state),
  unreadByStream: getUnreadByStream(state),
}))(SubscriptionsCard);
