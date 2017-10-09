/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import ChatContainer from './ChatContainer';

export default class ChatScreen extends PureComponent<void> {
  render() {
    return (
      <Screen title="Chat">
        <ChatContainer />
      </Screen>
    );
  }
}
