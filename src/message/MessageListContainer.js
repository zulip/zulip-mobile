import React, { PureComponent } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Actions, Fetching, Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import MessageList from './MessageList';
// import MessageList from './MessageListFlatList';
import MessageListWeb from './MessageListWeb';
import {
  getAuth,
  getCurrentTypingUsers,
  getRenderedMessages,
  getActiveNarrow,
  getFlags,
  getCaughtUpForActiveNarrow,
  getFetchingForActiveNarrow,
  getSubscriptions,
} from '../selectors';
import { filterUnreadMessageIds } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { queueMarkAsRead } from '../api';

type Props = {
  actions: Actions,
  caughtUp: boolean,
  fetching: Fetching,
  typingUsers: any,
  renderedMessages: any,
  narrow: Narrow,
  listRef: () => void,
  onReplySelect: () => void,
  onSend: () => void,
};

class MessageListContainer extends PureComponent<Props> {
  props: Props;

  handleMessageListScroll = (e: Object) => {
    const { auth, flags } = this.props;
    const visibleMessageIds = e.visibleIds.map(x => +x);
    const unreadMessageIds = filterUnreadMessageIds(visibleMessageIds, flags);

    if (unreadMessageIds.length > 0) {
      queueMarkAsRead(auth, unreadMessageIds);
    }

    // Calculates the amount user has scrolled up from the very bottom
    this.scrollOffset = e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height;

    registerAppActivity(auth);
  };

  render() {
    const {
      actions,
      caughtUp,
      fetching,
      typingUsers,
      onReplySelect,
      renderedMessages,
      narrow,
      experimentalFeaturesEnabled,
      listRef,
      onSend,
    } = this.props;

    const MessageListComponent = experimentalFeaturesEnabled ? MessageListWeb : MessageList;

    return (
      <MessageListComponent
        auth={this.props.auth}
        subscriptions={this.props.subscriptions}
        isFetching={false}
        actions={actions}
        caughtUpNewer={caughtUp.newer}
        caughtUpOlder={caughtUp.older}
        fetchingOlder={fetching.older}
        fetchingNewer={fetching.newer}
        onReplySelect={onReplySelect}
        typingUsers={typingUsers}
        renderedMessages={renderedMessages}
        narrow={narrow}
        listRef={listRef}
        onScroll={this.handleMessageListScroll}
        onSend={onSend}
      />
    );
  }
}

export default connectWithActions(state => ({
  experimentalFeaturesEnabled: state.settings.experimentalFeaturesEnabled,
  caughtUp: getCaughtUpForActiveNarrow(state),
  fetching: getFetchingForActiveNarrow(state),
  typingUsers: getCurrentTypingUsers(state),
  renderedMessages: getRenderedMessages(state),
  subscriptions: getSubscriptions(state),
  narrow: getActiveNarrow(state),
  auth: getAuth(state),
  flags: getFlags(state),
}))(connectActionSheet(MessageListContainer));
