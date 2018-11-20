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
  GlobalState,
  Message,
  MuteState,
  Narrow,
  RenderedSectionDescriptor,
  User,
} from '../types';
import type { RenderContext } from '../webview/html/messageAsHtml';
import { constructActionButtons, executeActionSheetAction } from './messageActionSheet';
import MessageListWeb from '../webview/MessageListWeb';
import {
  getAuth,
  getAllRealmEmojiById,
  getCurrentTypingUsers,
  getDebug,
  getRenderedMessages,
  getFlags,
  getAnchorForActiveNarrow,
  getFetchingForActiveNarrow,
  getOwnEmail,
  getSubscriptions,
  getShowMessagePlaceholders,
  getShownMessagesForNarrow,
  getRealm,
} from '../selectors';

export type OuterProps = {
  anchor?: number,
  fetching?: Fetching,
  messages?: Message[],
  narrow: Narrow,
  renderedMessages?: RenderedSectionDescriptor[],
  showMessagePlaceholders?: boolean,
  typingUsers?: User[],
};

export type ChildProps = {
  anchor: number,
  auth: Auth,
  debug: Debug,
  dispatch: Dispatch,
  fetching: Fetching,
  flags: FlagsState, // also in RenderContext
  messages: Message[],
  narrow: Narrow, // also in RenderContext
  renderedMessages: RenderedSectionDescriptor[],
  showMessagePlaceholders: boolean,
  typingUsers: User[],
};

// TODO get a type for `connectActionSheet` so this gets fully type-checked.
type Props = {
  // From caller and/or `connect`:
  ...$Exact<ChildProps>,
  ...$Exact<RenderContext>,

  mute: MuteState, // TODO where do we actually pass this?

  // From `connectActionSheet`.
  showActionSheetWithOptions: (Object, (number) => void) => void,

  // These are sometimes passed by the caller, or are never present here but
  // are for some other code which abuses this type.
  // TODO sort out each one's story.
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
    const message = this.props.messages.find(x => x.id === messageId);
    if (!message) {
      return;
    }

    const getString = value => this.context.intl.formatMessage({ id: value });
    const { auth, subscriptions, narrow, flags, mute } = this.props;
    const options = constructActionButtons(target)({
      message,
      getString,
      auth,
      narrow,
      flags,
      subscriptions,
      mute,
    });

    const { dispatch, onReplySelect } = this.props;
    const callback = buttonIndex => {
      executeActionSheetAction(target === 'header', options[buttonIndex], {
        message,
        getString,
        auth,
        subscriptions,
        dispatch,
        onReplySelect,
      });
    };

    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      callback,
    );
  };

  render() {
    const {
      // renderContext
      narrow,
      alertWords,
      ownEmail,
      flags,
      realmEmoji,
      subscriptions,
      twentyFourHourTime,

      // childProps
      anchor,
      auth,
      debug,
      dispatch,
      fetching,
      messages,
      renderedMessages,
      showMessagePlaceholders,
      typingUsers,
    } = this.props;
    const renderContext = {
      narrow,
      alertWords,
      flags,
      ownEmail,
      realmEmoji,
      subscriptions,
      twentyFourHourTime,
    };
    const childProps = {
      anchor,
      auth,
      debug,
      dispatch,
      fetching,
      flags,
      messages,
      narrow,
      renderedMessages,
      showMessagePlaceholders,
      typingUsers,
    };
    return (
      <MessageListWeb
        renderContext={renderContext}
        onLongPress={this.handleLongPress}
        {...childProps}
      />
    );
  }
}

export default connect((state: GlobalState, props: OuterProps) => ({
  alertWords: state.alertWords,
  anchor: props.anchor || getAnchorForActiveNarrow(props.narrow)(state),
  auth: getAuth(state),
  debug: getDebug(state),
  fetching: props.fetching || getFetchingForActiveNarrow(props.narrow)(state),
  flags: getFlags(state),
  messages: props.messages || getShownMessagesForNarrow(props.narrow)(state),
  ownEmail: getOwnEmail(state),
  realmEmoji: getAllRealmEmojiById(state),
  twentyFourHourTime: getRealm(state).twentyFourHourTime,
  renderedMessages: props.renderedMessages || getRenderedMessages(props.narrow)(state),
  showMessagePlaceholders:
    props.showMessagePlaceholders || getShowMessagePlaceholders(props.narrow)(state),
  subscriptions: getSubscriptions(state),
  typingUsers: props.typingUsers || getCurrentTypingUsers(props.narrow)(state),
}))(connectActionSheet(MessageList));
