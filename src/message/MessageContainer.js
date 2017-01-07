import React from 'react';

import { renderHtml } from './renderHtml';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';

export default class MessageContainer extends React.PureComponent {
  render() {
    const {
      auth, avatarUrl, timestamp, twentyFourHourTime, fromName, fromEmail, isBrief, reactions,
    } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;

    return (
      <MessageComponent
        message={renderHtml(this.props.message, this.props.auth)}
        avatarUrl={avatarUrl}
        fromName={fromName}
        fromEmail={fromEmail}
        timestamp={timestamp}
        twentyFourHourTime={twentyFourHourTime}
        reactions={reactions}
        selfEmail={auth.email}
      />
    );
  }
}
