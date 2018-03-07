/* @flow */
import React, { PureComponent } from 'react';

import type { Message, Narrow } from '../types';
import TaggedView from './TaggedView';
import TimeRow from './TimeRow';
import MessageContainer from './MessageContainer';

type Props = {
  isBrief: boolean,
  message: Message,
  narrow: Narrow,
  timestamp: number,
  type: 'time' | 'message',
  onLongPress: (messageId: number, target: string) => void,
};

export default class MessageListItem extends PureComponent<Props> {
  props: Props;

  render() {
    const { isBrief, type, timestamp, message, narrow, onLongPress } = this.props;

    if (type === 'time') {
      return <TimeRow key={`time${timestamp}`} timestamp={timestamp} />;
    } else if (message.isOutbox) {
      return <MessageContainer isBrief={isBrief} message={message} narrow={narrow} />;
    }

    return (
      <TaggedView key={message.id} tagID={message.id.toString()} collapsable={false}>
        <MessageContainer
          isBrief={isBrief}
          message={message}
          onLongPress={onLongPress}
          narrow={narrow}
        />
      </TaggedView>
    );
  }
}
