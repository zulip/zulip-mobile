/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Auth, GlobalState } from '../types';
import boundActions from '../boundActions';
import { nullFunction } from '../nullObjects';
import SearchScreen from '../search/SearchScreen';
import { subscriptionAdd, subscriptionRemove } from '../api';
import StreamList from '../streams/StreamList';
import { getAuth } from '../selectors';

class SubscriptionsScreen extends PureComponent {
  props: {
    auth: Auth,
    streams: [],
    subscriptions: [],
  };

  state: {
    filter: string,
  };

  state = {
    filter: '',
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

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
    const filteredStreams = streams.filter(x => x.name.includes(this.state.filter));
    const subsAndStreams = filteredStreams.map(x => ({
      ...x,
      subscribed: subscriptions.some(s => s.stream_id === x.stream_id),
    }));

    return (
      <SearchScreen title="Subscriptions" searchBarOnChange={this.handleFilterChange} searchBar>
        <StreamList
          streams={subsAndStreams}
          showSwitch
          showDescriptions
          onSwitch={this.handleSwitchChange}
          onPress={nullFunction}
        />
      </SearchScreen>
    );
  }
}

export default connect(
  (state: GlobalState) => ({
    auth: getAuth(state),
    streams: state.streams,
    subscriptions: state.subscriptions,
  }),
  boundActions,
)(SubscriptionsScreen);
