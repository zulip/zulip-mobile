import React from 'react';

import htmlToDomTree from '../html/htmlToDomTree';
import renderHtmlChildren from '../html/renderHtmlChildren';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';
import { isUrlInAppLink, getFullUrl, getMessageIdFromLink, getNarrowFromLink } from '../utils/url';
import openLink from '../utils/openLink';
import { isStreamNarrow } from '../utils/narrow';
import { showSnackBar } from '../common/showSnackBar';

export default class MessageContainer extends React.PureComponent {
  onPress = () => {
    this.props.pushRoute('subscriptions');
  }

  inAppLinkPress = href => {
    const { users, auth, doNarrow, streams } = this.props;
    const anchor = getMessageIdFromLink(href, auth.realm);
    const narrow = getNarrowFromLink(href, auth.realm, users);
    if (isStreamNarrow(narrow) && !streams.find((sub) => narrow[0].operand === sub.name)) {
      showSnackBar(`The stream ${narrow[0].operand} does not exist.`, 'Manage streams', this.onPress);
      return;
    }
    doNarrow(narrow, anchor);
  };

  regularLinkPress = href => openLink(getFullUrl(href, this.props.auth.realm));

  handleLinkPress = href =>
    (isUrlInAppLink(href, this.props.auth.realm) ? this.inAppLinkPress : this.regularLinkPress)(
      href,
    );

  onLongPress = () => {
    const { message, onLongPress } = this.props;
    onLongPress(message);
  }

  isStarred(message) {
    return message.flags && !!~(message.flags.indexOf('starred'));
  }

  render() {
    const { message, auth, avatarUrl, twentyFourHourTime, isBrief, doNarrow } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;
    const childrenNodes = htmlToDomTree(message.match_content || message.content);

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
        {renderHtmlChildren({ childrenNodes, auth, onPress: this.handleLinkPress })}
      </MessageComponent>
    );
  }
}
