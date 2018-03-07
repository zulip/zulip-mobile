/* @flow */
import React, { PureComponent } from 'react';

import type { Message, Narrow } from '../types';
import MessageHeaderContainer from './headers/MessageHeaderContainer';

type Props = {
  narrow: Narrow,
  message?: Message,
  onLongPress: (messageId: number, target: string) => void,
};

export default class MessageListSection extends PureComponent<Props> {
  props: Props;

  render() {
    const { onLongPress, message, narrow } = this.props;

    if (!message || Object.keys(message).length === 0) return null;

    return (
      <MessageHeaderContainer
        onLongPress={onLongPress}
        message={(onLongPress, message)}
        narrow={narrow}
      />
    );
  }
}
