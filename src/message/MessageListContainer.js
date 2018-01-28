/* @flow */
import React, { PureComponent } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type {
  Actions,
  Auth,
  Fetching,
  FlagsState,
  Message,
  MuteState,
  Narrow,
  Subscription,
} from '../types';
import connectWithActions from '../connectWithActions';
import {
  constructActionButtons,
  constructHeaderActionButtons,
  executeActionSheetAction,
} from '../message/messageActionSheet';
import MessageList from '../render-native/MessageListScrollView';
// import MessageList from '../render-native/MessageListFlatList';
import MessageListWeb from '../render-html/MessageListWeb';
import {
  getAuth,
  getAllRealmEmoji,
  getCurrentTypingUsers,
  getRenderedMessages,
  getActiveNarrow,
  getFlags,
  getIsFetching,
  getAnchorForActiveNarrow,
  getFetchingForActiveNarrow,
  getSubscriptions,
  getShowMessagePlaceholders,
  getShownMessagesInActiveNarrow,
} from '../selectors';
import { filterUnreadMessageIds } from '../utils/unread';
import { queueMarkAsRead } from '../api';

export type Props = {
  actions: Actions,
  anchor: number,
  auth: Auth,
  fetching: Fetching,
  flags: FlagsState,
  highlightUnreadMessages: boolean,
  htmlMessages: boolean,
  isFetching: boolean,
  messages: Message[],
  mute: MuteState,
  narrow: Narrow,
  realmEmoji: {},
  renderedMessages: any,
  showMessagePlaceholders: boolean,
  subscriptions: Subscription[],
  typingUsers?: any,
  listRef: (component: any) => void,
  onLongPress: (messageId: number, target: string) => void,
  onReplySelect: () => void,
  onScroll: (e: Event) => void,
  onSend: () => void,
  showActionSheetWithOptions: (Object, (number) => void) => void,
};

class MessageListContainer extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    intl: () => null,
  };

  handleLongPress = (messageId: number, target: string) => {
    const { messages, showActionSheetWithOptions } = this.props;
    const message = messages.find(x => x.id === messageId);

    if (!message) return;

    const getString = value => this.context.intl.formatMessage({ id: value });
    const options =
      target === 'message'
        ? constructActionButtons({
            ...this.props,
            message,
            getString,
          })
        : constructHeaderActionButtons({ ...this.props, message, getString });

    const callback = buttonIndex => {
      executeActionSheetAction({
        ...this.props,
        message,
        title: options[buttonIndex],
        header: target === 'header',
        getString,
      });
    };

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      callback,
    );
  };

  handleMessageListScroll = (e: Object) => {
    const { auth, flags } = this.props;
    const visibleMessageIds = e.visibleIds ? e.visibleIds.map(x => +x) : [];
    const unreadMessageIds = filterUnreadMessageIds(visibleMessageIds, flags);

    if (unreadMessageIds.length > 0) {
      queueMarkAsRead(auth, unreadMessageIds);
    }
  };

  render() {
    const { fetching, htmlMessages } = this.props;

    const MessageListComponent = htmlMessages ? MessageListWeb : MessageList;

    return (
      <MessageListComponent
        {...this.props}
        fetchingOlder={fetching.older}
        fetchingNewer={fetching.newer}
        onLongPress={this.handleLongPress}
        onScroll={this.handleMessageListScroll}
      />
    );
  }
}

export default connectWithActions((state, props) => ({
  anchor: props.anchor || getAnchorForActiveNarrow(state),
  auth: getAuth(state),
  fetching: props.fetching || getFetchingForActiveNarrow(state),
  flags: getFlags(state),
  htmlMessages: state.app.debug.htmlMessages,
  highlightUnreadMessages: state.app.debug.highlightUnreadMessages,
  isFetching: props.isFetching || getIsFetching(state),
  messages: props.messages || getShownMessagesInActiveNarrow(state),
  narrow: props.narrow || getActiveNarrow(state),
  realmEmoji: getAllRealmEmoji(state),
  renderedMessages: props.renderedMessages || getRenderedMessages(state),
  showMessagePlaceholders: props.showMessagePlaceholders || getShowMessagePlaceholders(state),
  subscriptions: getSubscriptions(state),
  typingUsers: props.typingUsers || getCurrentTypingUsers(state),
}))(connectActionSheet(MessageListContainer));
