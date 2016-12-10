import React from 'react';

import Chat from './Chat';

export default class StreamScreen extends React.PureComponent {

  render() {
    return (
      <Screen>
        <Chat {...this.props} />
      </Screen>
    );
  }
}
