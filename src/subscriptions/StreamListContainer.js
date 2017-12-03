/* @flow */
import type { GlobalState } from '../types';
import { getAuth } from '../selectors';
import connectWithActions from '../connectWithActions';
import StreamListCard from './StreamListCard';

export default connectWithActions((state: GlobalState) => ({
  auth: getAuth(state),
  streams: state.streams,
  subscriptions: state.subscriptions,
}))(StreamListCard);
