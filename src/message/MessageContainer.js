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
    const message = await renderHtml(this.props.message);
    this.setState({ message });
  }

  render() {
    const { avatarUrl, timestamp, twentyFourHourTime, from, isBrief } = this.props;
    const { message } = this.state;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;

    return (
      <MessageComponent
        message={message}
        avatarUrl={avatarUrl}
        from={from}
        timestamp={timestamp}
        twentyFourHourTime={twentyFourHourTime}
      />
    );
  }
}
