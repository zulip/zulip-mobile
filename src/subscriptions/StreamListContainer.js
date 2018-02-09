/* @flow */
import type { GlobalState } from '../types';
import { getAuth, getStreams, getSubscriptions } from '../selectors';
import connectWithActions from '../connectWithActions';
import StreamListCard from './StreamListCard';

export default connectWithActions((state: GlobalState) => ({
  auth: getAuth(state),
  streams: getStreams(state),
  subscriptions: getSubscriptions(state),
}))(StreamListCard);
