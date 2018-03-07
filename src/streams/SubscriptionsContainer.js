/* @flow */
import connectWithActions from '../connectWithActions';
import type { GlobalState } from '../types';
import { getUnreadByStream } from '../selectors';
import SubscriptionsCard from './SubscriptionsCard';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';

export default connectWithActions((state: GlobalState, props) => ({
  narrow: props.narrow || [],
  // Main scrren long longer conatin drawer,
  // so at any position we cannot show selected stream in the list
  // needs to be removed when we finalize navigation without drawer
  subscriptions: getSubscribedStreams(state),
  unreadByStream: getUnreadByStream(state),
}))(SubscriptionsCard);
