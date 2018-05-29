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
  RealmEmojiState,
  Subscription,
  User,
} from '../types';
import connectWithActions from '../connectWithActions';
import { constructActionButtons, executeActionSheetAction } from './messageActionSheet';
import MessageListWeb from '../webview/MessageListWeb';
import {
  getAuth,
  getAllRealmEmoji,
  getCurrentTypingUsers,
  getDebug,
  getRenderedMessages,
  getFlags,
  getIsFetching,
  getAnchorForActiveNarrow,
  getFetchingForActiveNarrow,
  getSubscriptions,
  getShowMessagePlaceholders,
  getShownMessagesForNarrow,
} from '../selectors';

export type Props = {
  actions: Actions,
  anchor: number,
  auth: Auth,
  debug: Object,
  fetching: Fetching,
  flags: FlagsState,
  highlightUnreadMessages: boolean,
  isFetching: boolean,
  messages: Message[],
  mute: MuteState,
  narrow: Narrow,
  realmEmoji: RealmEmojiState,
  renderedMessages: any,
  showMessagePlaceholders: boolean,
  subscriptions: Subscription[],
  typingUsers: User[],
  listRef: (component: any) => void,
  onLongPress: (messageId: number, target: string) => void,
  onReplySelect: () => void,
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
    const options = constructActionButtons(target)({
      ...this.props,
      message,
      getString,
    });

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

  render() {
    return <MessageListWeb {...this.props} onLongPress={this.handleLongPress} />;
  }
}

export default connectWithActions((state, props) => ({
  anchor: props.anchor || getAnchorForActiveNarrow(props.narrow)(state),
  auth: getAuth(state),
  debug: getDebug(state),
  fetching: props.fetching || getFetchingForActiveNarrow(props.narrow)(state),
  flags: getFlags(state),
  isFetching: props.isFetching || getIsFetching(props.narrow)(state),
  messages: props.messages || getShownMessagesForNarrow(props.narrow)(state),
  realmEmoji: getAllRealmEmoji(state),
  renderedMessages: props.renderedMessages || getRenderedMessages(props.narrow)(state),
  showMessagePlaceholders:
    props.showMessagePlaceholders || getShowMessagePlaceholders(props.narrow)(state),
  subscriptions: getSubscriptions(state),
  typingUsers: props.typingUsers || getCurrentTypingUsers(props.narrow)(state),
}))(connectActionSheet(MessageListContainer));
