/* @flow */
import { connect } from 'react-redux';

import type { GlobalState } from '../types';
import { getAuth } from '../selectors';
import boundActions from '../boundActions';
import SubscriptionsCard from './SubscriptionsCard';
import { getUnreadStreams } from '../baseSelectors';
import { queueMarkAsRead } from '../api';

export default connect(
  (state: GlobalState) => ({
    auth: getAuth(state),
    streams: state.streams,
    subscriptions: state.subscriptions,
    markStreamMessagesRead: (streamId: number) => {
      const removeIds = [].concat(
        ...getUnreadStreams(state)
          .filter(stream => streamId === stream.stream_id)
          .map(stream => stream.unread_message_ids),
      );

      if (removeIds.length > 0) {
        queueMarkAsRead(getAuth(state), removeIds);
      }
    },
  }),
  boundActions,
)(SubscriptionsCard);
