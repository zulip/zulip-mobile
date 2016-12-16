import React from 'react';

import { renderHtml } from './renderHtml';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';

export default class MessageContainer extends React.PureComponent {

  state = {
    message: null,
  };

  constructor(props) {
    super(props);
    this.renderMessage();
  }

  async renderMessage() {
    const { message, auth } = this.props;
    this.setState({
      message: await renderHtml(message, auth),
    });
  }

  render() {
    const { avatarUrl, timestamp, twentyFourHourTime, fromName, fromEmail, isBrief } = this.props;
    const { message } = this.state;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;

    return (
      <MessageComponent
        message={message}
        avatarUrl={avatarUrl}
        fromName={fromName}
        fromEmail={fromEmail}
        timestamp={timestamp}
        twentyFourHourTime={twentyFourHourTime}
      />
    );
  }
}
