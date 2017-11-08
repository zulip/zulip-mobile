/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Actions, Auth, SubscriptionsState, Narrow, Message } from '../types';
import { logErrorRemotely } from '../utils/logging';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';
import {
  getAuth,
  getFlags,
  getSubscriptions,
  getCurrentRoute,
  getActiveNarrow,
} from '../selectors';
import connectWithActions from '../connectWithActions';
import { constructActionButtons, executeActionSheetAction } from './messageActionSheet';
import type { ShowActionSheetTypes } from './messageActionSheet';

type Props = {
  actions: Actions,
  currentRoute: string,
  message: Object,
  narrow: Narrow,
  subscriptions: SubscriptionsState,
  auth: Auth,
  flags: Object,
  twentyFourHourTime: boolean,
  unreadMessages: boolean,
  isBrief: boolean,
  onReplySelect?: () => void,
  showActionSheetWithOptions: (Object, (number) => void) => void,
};

type State = {
  hasError: boolean,
};

class MessageContainer extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = { hasError: false };

  static contextTypes = {
    intl: () => null,
  };

  static defaultProps = {
    twentyFourHourTime: false,
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    logErrorRemotely(error, info);
  }

  isStarred(message: Message) {
    const { flags } = this.props;
    return message.id in flags.starred;
  }

  showActionSheet = ({ options, cancelButtonIndex, callback }: ShowActionSheetTypes) => {
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      callback,
    );
  };

  handleLongPress = () => {
    const {
      actions,
      auth,
      narrow,
      subscriptions,
      flags,
      message,
      currentRoute,
      onReplySelect,
    } = this.props;
    const getString = value => this.context.intl.formatMessage({ id: value });
    const options = constructActionButtons({
      message,
      auth,
      narrow,
      flags,
      currentRoute,
      getString,
    });
    const callback = buttonIndex => {
      executeActionSheetAction({
        title: options[buttonIndex],
        message,
        actions,
        auth,
        subscriptions,
        currentRoute,
        onReplySelect,
        getString,
      });
    };

    this.showActionSheet({ options, cancelButtonIndex: options.length - 1, callback });
  };

  render() {
    if (this.state.hasError) {
      return <Text>Error</Text>;
    }

    const { message, auth, actions, twentyFourHourTime, unreadMessages, isBrief } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;
    const isUnread = !(message.id in this.props.flags.read);
    const isUnread2 = message.flags && message.flags.indexOf('read') === -1;
    const style = unreadMessages
      ? {
          backgroundColor: isUnread !== isUnread2 ? 'red' : isUnread ? 'pink' : 'transparent',
        }
      : null;

    return (
      <MessageComponent
        style={style}
        message={message}
        twentyFourHourTime={twentyFourHourTime}
        ownEmail={auth.email}
        onLongPress={this.handleLongPress}
        starred={this.isStarred(message)}
        realm={auth.realm}
        auth={auth}
        actions={actions}
        onLinkPress={actions.messageLinkPress}
      />
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  unreadMessages: state.app.debug.unreadMessages,
  narrow: getActiveNarrow(state),
  currentRoute: getCurrentRoute(state),
  flags: getFlags(state),
  twentyFourHourTime: state.realm.twentyFourHourTime,
  subscriptions: getSubscriptions(state),
}))(connectActionSheet(MessageContainer));
