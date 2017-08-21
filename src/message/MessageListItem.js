/* @flow */
import React, { PureComponent } from 'react';

import type { Message } from '../types';
import TaggedView from '../native/TaggedView';
import TimeRow from './TimeRow';
import MessageContainer from './MessageContainer';

export default class MessageListItem extends PureComponent {
  props: {
    isBrief: boolean,
    type: 'time' | 'message',
    timestamp: number,
    message: Message,
  };

  render() {
    const { isBrief, type, timestamp, message } = this.props;

    if (type === 'time') {
      return <TimeRow key={`time${timestamp}`} timestamp={timestamp} />;
    } else if (message.isOutbox) {
      return <MessageContainer isBrief={isBrief} message={message} />;
    }

    return (
      <TaggedView key={message.id} tagID={message.id.toString()} collapsable={false}>
        <MessageContainer isBrief={isBrief} message={message} />
      </TaggedView>
    );
  }
}
