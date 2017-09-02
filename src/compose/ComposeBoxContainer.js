/* @flow */
import { connect } from 'react-redux';

import type { GlobalState } from '../types';
import boundActions from '../boundActions';
import { getAuth, getLastTopicInActiveNarrow, canSendToActiveNarrow } from '../selectors';
import { getIsActiveStreamSubscribed } from '../subscriptions/subscriptionSelectors';
import { getDraftForActiveNarrow } from '../drafts/draftsSelectors';
import ComposeBox from './ComposeBox';

export default connect(
  (state: GlobalState) => ({
    auth: getAuth(state),
    narrow: state.chat.narrow,
    users: state.users,
    composeTools: state.app.composeTools,
    lastTopic: getLastTopicInActiveNarrow(state),
    isSubscribed: getIsActiveStreamSubscribed(state),
    canSend: canSendToActiveNarrow(state),
    editMessage: state.app.editMessage,
    draft: getDraftForActiveNarrow(state),
  }),
  boundActions,
)(ComposeBox);
