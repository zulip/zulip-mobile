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
    const message = await renderHtml(this.props.message, this.props.context);
    this.setState({ message });
  }

  render() {
    const { context, avatarUrl, timestamp, from, isBrief } = this.props;
    const { message } = this.state;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;

    return (
      <MessageComponent
        message={message}
        avatarUrl={context.rewriteLink(avatarUrl).uri}
        from={from}
        timestamp={timestamp}
      />
    );
  }
}
