/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type {
  AlertWordsState,
  Auth,
  Context,
  Debug,
  Dispatch,
  Fetching,
  FlagsState,
  GlobalState,
  Message,
  MuteState,
  Narrow,
  RealmEmojiState,
  RenderedSectionDescriptor,
  Subscription,
  User,
} from '../types';
import { constructActionButtons, executeActionSheetAction } from './messageActionSheet';
import MessageListWeb from '../webview/MessageListWeb';
import {
  getAuth,
  getAllRealmEmojiById,
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

export type OuterProps = {
  anchor?: number,
  fetching?: Fetching,
  isFetching?: boolean,
  messages?: Message[],
  narrow: Narrow,
  renderedMessages?: RenderedSectionDescriptor[],
  showMessagePlaceholders?: boolean,
  typingUsers?: User[],
};

// TODO get a type for `connectActionSheet` so this gets fully type-checked.
export type Props = {
  // From caller and/or `connect`.
  alertWords: AlertWordsState,
  anchor: number,
  auth: Auth,
  debug: Debug,
  dispatch: Dispatch,
  fetching: Fetching,
  flags: FlagsState,
  isFetching: boolean,
  messages: Message[],
  narrow: Narrow,
  realmEmoji: RealmEmojiState,
  renderedMessages: RenderedSectionDescriptor[],
  showMessagePlaceholders: boolean,
  subscriptions: Subscription[],
  twentyFourHourTime: boolean,
  typingUsers: User[],

  mute: MuteState, // TODO where do we actually pass this?

  // From `connectActionSheet`.
  showActionSheetWithOptions: (Object, (number) => void) => void,

  // These are sometimes passed by the caller, or are never present here but
  // are for some other code which abuses this type.
  // TODO sort out each one's story.
  listRef: (component: any) => void,
  onLongPress: (messageId: number, target: string) => void,
  onReplySelect: () => void,
  onSend: () => void,
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

export default connect((state: GlobalState, props: OuterProps) => ({
  alertWords: state.alertWords,
  anchor: props.anchor || getAnchorForActiveNarrow(props.narrow)(state),
  auth: getAuth(state),
  debug: getDebug(state),
  fetching: props.fetching || getFetchingForActiveNarrow(props.narrow)(state),
  flags: getFlags(state),
  isFetching: props.isFetching || getIsFetching(props.narrow)(state),
  messages: props.messages || getShownMessagesForNarrow(props.narrow)(state),
  realmEmoji: getAllRealmEmojiById(state),
  twentyFourHourTime: getRealm(state).twentyFourHourTime,
  renderedMessages: props.renderedMessages || getRenderedMessages(props.narrow)(state),
  showMessagePlaceholders:
    props.showMessagePlaceholders || getShowMessagePlaceholders(props.narrow)(state),
  subscriptions: getSubscriptions(state),
  typingUsers: props.typingUsers || getCurrentTypingUsers(props.narrow)(state),
}))(connectActionSheet(MessageList));
