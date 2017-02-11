import React from 'react';
import { connect } from 'react-redux';

import { Auth } from '../types';
import boundActions from '../boundActions';
import { Screen } from '../common';
import { subscriptionAdd, subscriptionRemove } from '../api';
import StreamList from '../streamlist/StreamList';
import { getAuth } from '../account/accountSelectors';


class SubscriptionsScreen extends React.Component {

  props: {
    auth: Auth,
    streams: [],
    subscriptions: [],
  };

  handleSwitchChange = (streamName: string, switchValue: boolean) => {
    const { auth } = this.props;

    if (switchValue) {
      subscriptionAdd(auth, [{ name: streamName }]);
    } else {
      subscriptionRemove(auth, [streamName]);
    }
  };

  render() {
    const { streams, subscriptions } = this.props;
    const subsAndStreams = streams.map(x => ({
      ...x,
      subscribed: subscriptions.some(s => s.stream_id === x.stream_id),
    }));

    return (
      <Screen title="Subscriptions">
        <StreamList
          streams={subsAndStreams}
          showSwitch
          showDescriptions
          onNarrow={() => {}}
          onSwitch={this.handleSwitchChange}
        />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    streams: state.streams,
    subscriptions: state.subscriptions,
  }),
  boundActions,
)(SubscriptionsScreen);
