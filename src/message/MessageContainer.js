/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { RenderTest } from 'react-native-js-watchdog';

import type { Actions, Auth, SubscriptionsState, MuteState, Narrow } from '../types';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';
import { isUrlInAppLink, getFullUrl, getMessageIdFromLink, getNarrowFromLink } from '../utils/url';
import openLink from '../utils/openLink';
import { getAuth, getUsers, getFlags, getSubscriptions, getCurrentRoute } from '../selectors';
import boundActions from '../boundActions';
import { constructActionButtons, executeActionSheetAction } from './messageActionSheet';
import type { ShowActionSheetTypes } from './messageActionSheet';

type Href = string;

class MessageContainer extends PureComponent {
  props: {
    actions: Actions,
    currentRoute: string,
    message: Object,
    narrow: Narrow,
    subscriptions: SubscriptionsState,
    users: Object[],
    auth: Auth,
    flags: Object,
    twentyFourHourTime: boolean,
    isBrief: boolean,
    mute: MuteState,
    showActionSheetWithOptions: (Object, (number) => void) => void,
  };

  static defaultProps = {
    twentyFourHourTime: false,
  };

  inAppLinkPress = (href: Href) => {
    const { actions, users, auth } = this.props;
    const anchor = getMessageIdFromLink(href, auth.realm);
    const narrow = getNarrowFromLink(href, auth.realm, users);
    actions.doNarrow(narrow, anchor);
  };

  regularLinkPress = (href: Href) => {
    openLink(getFullUrl(href, this.props.auth.realm));
  };

  handleLinkPress = (href: Href) =>
    (isUrlInAppLink(href, this.props.auth.realm) ? this.inAppLinkPress : this.regularLinkPress)(
      href,
    );

  isStarred(message: Object) {
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
    const { actions, auth, narrow, subscriptions, mute, flags, message, currentRoute } = this.props;
    const options = constructActionButtons({
      message,
      auth,
      narrow,
      subscriptions,
      mute,
      flags,
      currentRoute,
    });
    const callback = buttonIndex => {
      executeActionSheetAction({
        title: options[buttonIndex],
        message,
        actions,
        auth,
        subscriptions,
        currentRoute,
      });
    };

    this.showActionSheet({ options, cancelButtonIndex: options.length - 1, callback });
  };

  render() {
    const { message, auth, actions, twentyFourHourTime, isBrief } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;

    return (
      <MessageComponent
        message={message}
        twentyFourHourTime={twentyFourHourTime}
        ownEmail={auth.email}
        doNarrow={actions.doNarrow}
        onLongPress={this.handleLongPress}
        starred={this.isStarred(message)}
        realm={auth.realm}
        auth={auth}
        actions={actions}
        handleLinkPress={this.handleLinkPress}
      />
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    currentRoute: getCurrentRoute(state),
    users: getUsers(state),
    flags: getFlags(state),
    twentyFourHourTime: state.realm.twentyFourHourTime,
    subscriptions: getSubscriptions(state),
    mute: state.mute,
  }),
  boundActions,
)(connectActionSheet(RenderTest(MessageContainer, { verbose: false })));
