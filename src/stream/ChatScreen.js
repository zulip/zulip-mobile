import React from 'react';

import ComposeBox from '../compose/ComposeBox';

export default class StreamScreen extends React.PureComponent {

  render() {
    return (
      <Screen>
        {/* <StreamView
          messages={messages}
          subscriptions={subscriptions}
          auth={auth}
          caughtUp={caughtUp}
          fetchOlder={this.fetchOlder}
          fetchNewer={this.fetchNewer}
          narrow={this.narrow}
        /> */}
        <ComposeBox />
      </Screen>
    );
  }
}
