/* @flow */
import type { GlobalState } from '../types';
import { getAuth, getCanCreateStreams, getStreams, getSubscriptions } from '../selectors';
import connectWithActions from '../connectWithActions';
import StreamListCard from './StreamListCard';

export default connectWithActions((state: GlobalState) => ({
  auth: getAuth(state),
  canCreateStreams: getCanCreateStreams(state),
  streams: getStreams(state),
  subscriptions: getSubscriptions(state),
}))(StreamListCard);
