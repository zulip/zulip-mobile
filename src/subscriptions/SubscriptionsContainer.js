/* @flow */
import { connect } from 'react-redux';

import type { GlobalState } from '../types';
import { getAuth } from '../selectors';
import boundActions from '../boundActions';
import SubscriptionsCard from './SubscriptionsCard';

export default connect(
  (state: GlobalState) => ({
    auth: getAuth(state),
    streams: state.streams,
    subscriptions: state.subscriptions,
  }),
  boundActions,
)(SubscriptionsCard);
