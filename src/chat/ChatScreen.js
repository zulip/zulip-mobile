import React from 'react';

import { Screen } from '../common';
import Chat from './Chat';

export default class ChatScreen extends React.PureComponent {

  render() {
    return (
      <Screen title="Chat">
        <Chat {...this.props} />
      </Screen>
    );
  }
}
