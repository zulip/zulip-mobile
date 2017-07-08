/* @flow */
import React from 'react';

import type { Actions, Auth } from '../types';
import htmlToDomTree from '../html/htmlToDomTree';
import renderHtmlChildren from '../html/renderHtmlChildren';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';
import { isUrlInAppLink, getFullUrl, getMessageIdFromLink, getNarrowFromLink } from '../utils/url';
import openLink from '../utils/openLink';

type Href = string;

export default class MessageContainer extends React.PureComponent {
  props: {
    actions: Actions,
    message: Object,
    onLongPress: (message: Object) => void,
    users: Object[],
    auth: Auth,
    flags: Object,
    avatarUrl: string,
    twentyFourHourTime?: boolean,
    isBrief: boolean,
  };

  defaultProps: {
    twentyFourHourTime: false,
  };

  inAppLinkPress = (href: Href) => {
    const { actions, users, auth } = this.props;
    const anchor = getMessageIdFromLink(href, auth.realm);
    const narrow = getNarrowFromLink(href, auth.realm, users);
    actions.doNarrow(narrow, anchor);
  };

  regularLinkPress = (href: Href) => openLink(getFullUrl(href, this.props.auth.realm));

  handleLinkPress = (href: Href) =>
    (isUrlInAppLink(href, this.props.auth.realm) ? this.inAppLinkPress : this.regularLinkPress)(
      href,
    );

  onLongPress = () => {
    const { message, onLongPress } = this.props;
    onLongPress(message);
  };

  isStarred(message: Object) {
    const { flags } = this.props;
    return message.id in flags.starred;
  }

  render() {
    const {
      message,
      auth,
      actions,
      avatarUrl,
      twentyFourHourTime,
      isBrief,
    } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;
    const childrenNodes = htmlToDomTree(message.match_content || message.content);

    return (
      <MessageComponent
        message={message}
        avatarUrl={avatarUrl}
        twentyFourHourTime={twentyFourHourTime}
        selfEmail={auth.email}
        doNarrow={actions.doNarrow}
        onLongPress={this.onLongPress}
        starred={this.isStarred(message)}
        realm={auth.realm}
      >
        {renderHtmlChildren({
          childrenNodes,
          auth,
          actions,
          message,
          onPress: this.handleLinkPress,
        })}
      </MessageComponent>
    );
  }
}
