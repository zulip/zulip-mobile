import React from 'react';
import { connect } from 'react-redux';

import { Auth } from '../types';
import boundActions from '../boundActions';
import StreamList from '../streamlist/StreamList';
import { Screen } from '../common';
import { getAuth } from '../account/accountSelectors';


class SubscriptionsScreen extends React.Component {

  props: {
    auth: Auth,
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
