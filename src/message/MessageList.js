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
  getMute,
  getOwnEmail,
  getSubscriptions,
  getShowMessagePlaceholders,
  getShownMessagesForNarrow,
  getRealm,
} from '../selectors';

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
  mute: MuteState,

  // From `connectActionSheet`.
  showActionSheetWithOptions: (Object, (number) => void) => void,
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

    const { dispatch } = this.props;
    const callback = buttonIndex => {
      executeActionSheetAction(target === 'header', options[buttonIndex], {
        message,
        getString,
        auth,
        subscriptions,
        dispatch,
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

type OuterProps = {
  narrow: Narrow,

  /* Remaining props are derived from `narrow` by default. */

  messages?: Message[],
  renderedMessages?: RenderedSectionDescriptor[],
  anchor?: number,

  /* Passing these three from the parent is kind of a hack; search uses it
     to hard-code some behavior. */
  fetching?: Fetching,
  showMessagePlaceholders?: boolean,
  typingUsers?: User[],
};

export default connect((state: GlobalState, props: OuterProps) => ({
  alertWords: state.alertWords,
  anchor: props.anchor || getAnchorForActiveNarrow(props.narrow)(state),
  auth: getAuth(state),
  debug: getDebug(state),
  fetching: props.fetching || getFetchingForActiveNarrow(props.narrow)(state),
  flags: getFlags(state),
  messages: props.messages || getShownMessagesForNarrow(props.narrow)(state),
  mute: getMute(state),
  ownEmail: getOwnEmail(state),
  realmEmoji: getAllRealmEmojiById(state),
  twentyFourHourTime: getRealm(state).twentyFourHourTime,
  renderedMessages: props.renderedMessages || getRenderedMessages(props.narrow)(state),
  showMessagePlaceholders:
    props.showMessagePlaceholders || getShowMessagePlaceholders(props.narrow)(state),
  subscriptions: getSubscriptions(state),
  typingUsers: props.typingUsers || getCurrentTypingUsers(props.narrow)(state),
}))(connectActionSheet(MessageList));
