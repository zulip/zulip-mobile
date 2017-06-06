import React from 'react';
import { Linking } from 'react-native';

import htmlToDomTree from '../html/htmlToDomTree';
import renderHtmlChildren from '../html/renderHtmlChildren';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';
import { isUrlInAppLink, getFullUrl, getMessageIdFromLink, getNarrowFromLink } from '../utils/url';

export default class MessageContainer extends React.PureComponent {
  inAppLinkPress = href => {
    const { users, auth, doNarrow } = this.props;
    const anchor = getMessageIdFromLink(href, auth.realm);
    const narrow = getNarrowFromLink(href, auth.realm, users);
    doNarrow(narrow, anchor);
  };

  regularLinkPress = href => Linking.openURL(getFullUrl(href, this.props.auth.realm));

  handleLinkPress = href =>
    (isUrlInAppLink(href, this.props.auth.realm) ? this.inAppLinkPress : this.regularLinkPress)(
      href,
    );

  onLongPress = () => {
    const { message, onLongPress } = this.props;
    onLongPress(message);
  };

  isStarred(message) {
    return message.flags && !!~message.flags.indexOf('starred');
  }

  render() {
    const { message, auth, avatarUrl, twentyFourHourTime, isBrief, doNarrow } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;
    const childrenNodes = htmlToDomTree(message.content);

    return (
      <MessageComponent
        message={message}
        avatarUrl={avatarUrl}
        twentyFourHourTime={twentyFourHourTime}
        selfEmail={auth.email}
        doNarrow={doNarrow}
        onLongPress={this.onLongPress}
        starred={this.isStarred(message)}
        realm={auth.realm}
      >
        {renderHtmlChildren({ childrenNodes, auth, onPress: this.handleLinkPress, message })}
      </MessageComponent>
    );
  }
}
