/* @flow */
import type { GlobalState } from '../types';
import { getAuth } from '../selectors';
import connectWithActions from '../connectWithActions';
import SubscriptionsCard from './SubscriptionsCard';

export default connectWithActions((state: GlobalState) => ({
  auth: getAuth(state),
  streams: state.streams,
  subscriptions: state.subscriptions,
}))(SubscriptionsCard);
