/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import Chat from './Chat';

export default class ChatScreen extends PureComponent {
  render() {
    return (
      <Screen title="Chat">
        <Chat {...this.props} />
      </Screen>
    );
  }
}
