/* @flow */
import React, { PureComponent } from 'react';

import type { Message } from '../types';
import TaggedView from './TaggedView';
import TimeRow from './TimeRow';
import MessageContainer from './MessageContainer';

type Props = {
  isBrief: boolean,
  type: 'time' | 'message',
  timestamp: number,
  message: Message,
  onReplySelect?: () => void,
};

export default class MessageListItem extends PureComponent<Props> {
  props: Props;

  render() {
    const { isBrief, type, timestamp, message, onReplySelect } = this.props;

    if (type === 'time') {
      return <TimeRow key={`time${timestamp}`} timestamp={timestamp} />;
    } else if (message.isOutbox) {
      return <MessageContainer isBrief={isBrief} message={message} />;
    }

    return (
      <TaggedView key={message.id} tagID={message.id.toString()} collapsable={false}>
        <MessageContainer isBrief={isBrief} message={message} onReplySelect={onReplySelect} />
      </TaggedView>
    );
  }
}
