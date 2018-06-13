/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type {
  Auth,
  Context,
  Debug,
  Dispatch,
  Fetching,
  FlagsState,
  Message,
  MuteState,
  Narrow,
  RealmEmojiState,
  Subscription,
  User,
} from '../types';
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
  getRealm,
} from '../selectors';

export type Props = {
  anchor: number,
  auth: Auth,
  debug: Debug,
  dispatch: Dispatch,
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
  twentyFourHourTime: boolean,
};

class MessageList extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    intl: () => null,
  };

  handleLongPress = (messageId: number, target: string) => {
    const { messages, showActionSheetWithOptions } = this.props;
    const message = messages.find(x => x.id === messageId);

    if (!message) {
      return;
    }

    const getString = value => this.context.intl.formatMessage({ id: value });
    const options = constructActionButtons(target)({
      ...this.props,
      message,
      getString,
    });

    const callback = buttonIndex => {
      executeActionSheetAction(target === 'header', options[buttonIndex], {
        ...this.props,
        message,
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

export default connect((state, props) => ({
  anchor: props.anchor || getAnchorForActiveNarrow(props.narrow)(state),
  auth: getAuth(state),
  debug: getDebug(state),
  fetching: props.fetching || getFetchingForActiveNarrow(props.narrow)(state),
  flags: getFlags(state),
  isFetching: props.isFetching || getIsFetching(props.narrow)(state),
  messages: props.messages || getShownMessagesForNarrow(props.narrow)(state),
  realmEmoji: getAllRealmEmoji(state),
  twentyFourHourTime: getRealm(state).twentyFourHourTime,
  renderedMessages: props.renderedMessages || getRenderedMessages(props.narrow)(state),
  showMessagePlaceholders:
    props.showMessagePlaceholders || getShowMessagePlaceholders(props.narrow)(state),
  subscriptions: getSubscriptions(state),
  typingUsers: props.typingUsers || getCurrentTypingUsers(props.narrow)(state),
}))(connectActionSheet(MessageList));
