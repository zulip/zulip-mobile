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
import { showActionSheet } from './messageActionSheet';
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
  renderContext: RenderContext,
  renderedMessages: RenderedSectionDescriptor[],
  showMessagePlaceholders: boolean,
  typingUsers: User[],
};

// TODO get a type for `connectActionSheet` so this gets fully type-checked.
type Props = {
  // From caller and/or `connect`:
  ...$Exact<ChildProps>,
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
    const { auth, dispatch, narrow, flags, mute } = this.props;
    const { subscriptions } = this.props.renderContext;
    showActionSheet(target === 'header', dispatch, this.props.showActionSheetWithOptions, {
      message,
      getString,
      auth,
      narrow,
      flags,
      subscriptions,
      mute,
    });
  };

  render() {
    const {
      // childProps
      anchor,
      auth,
      debug,
      dispatch,
      fetching,
      messages,
      narrow,
      renderContext,
      renderedMessages,
      showMessagePlaceholders,
      typingUsers,
    } = this.props;
    const childProps = {
      anchor,
      auth,
      debug,
      dispatch,
      fetching,
      flags: renderContext.flags,
      messages,
      narrow,
      renderContext,
      renderedMessages,
      showMessagePlaceholders,
      typingUsers,
    };
    return <MessageListWeb onLongPress={this.handleLongPress} {...childProps} />;
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

export default connect((state: GlobalState, props: OuterProps) => {
  // TODO Ideally this ought to be a caching selector that doesn't change
  // when the inputs don't.  Doesn't matter in a practical way here, because
  // all our `render` does is make a `MessageListWeb`, and it has a
  // `shouldComponentUpdate` that doesn't look at this prop... but it'd be
  // better to set an example of the right general pattern.
  const renderContext: RenderContext = {
    narrow: props.narrow,
    alertWords: state.alertWords,
    flags: getFlags(state), // also a prop, see below
    ownEmail: getOwnEmail(state),
    realmEmoji: getAllRealmEmojiById(state),
    subscriptions: getSubscriptions(state),
    twentyFourHourTime: getRealm(state).twentyFourHourTime,
  };

  return {
    renderContext,
    anchor: props.anchor || getAnchorForActiveNarrow(props.narrow)(state),
    auth: getAuth(state),
    debug: getDebug(state),
    fetching: props.fetching || getFetchingForActiveNarrow(props.narrow)(state),
    flags: getFlags(state),
    messages: props.messages || getShownMessagesForNarrow(props.narrow)(state),
    mute: getMute(state),
    renderedMessages: props.renderedMessages || getRenderedMessages(props.narrow)(state),
    showMessagePlaceholders:
      props.showMessagePlaceholders || getShowMessagePlaceholders(props.narrow)(state),
    typingUsers: props.typingUsers || getCurrentTypingUsers(props.narrow)(state),
  };
})(connectActionSheet(MessageList));
