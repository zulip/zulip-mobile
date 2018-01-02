/* @flow */
import React, { PureComponent } from 'react';

import type { Message } from '../types';
import MessageHeaderContainer from './headers/MessageHeaderContainer';

type Props = {
  message?: Message,
};

export default class MessageListSection extends PureComponent<Props> {
  props: Props;

  render() {
    const { message } = this.props;

    if (!message || Object.keys(message).length === 0) return null;

    return <MessageHeaderContainer message={message} />;
  }
}
