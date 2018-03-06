/* @flow */
import connectWithActions from '../connectWithActions';
import type { GlobalState } from '../types';
import { getUnreadByStream } from '../selectors';
import SubscriptionsCard from './SubscriptionsCard';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';

export default connectWithActions((state: GlobalState, props) => ({
  narrow: props.narrow || [], // TODO
  subscriptions: getSubscribedStreams(state),
  unreadByStream: getUnreadByStream(state),
}))(SubscriptionsCard);
