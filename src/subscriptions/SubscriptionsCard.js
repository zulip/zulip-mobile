/* @flow */
import React, { PureComponent } from 'react';

import type { Auth } from '../types';
import { nullFunction } from '../nullObjects';
import { subscriptionAdd, subscriptionRemove } from '../api';
import StreamList from '../streams/StreamList';

type Props = {
  auth: Auth,
  streams: [],
  subscriptions: [],
};

type State = {
  filter: string,
};

export default class SubscriptionsCard extends PureComponent<Props, State> {
  props: Props;

  state: State;

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

  clearInput = () => {
    this.setState({ filter: '' });
  };

  render() {
    const { streams, subscriptions } = this.props;
    const filteredStreams = streams.filter(x => x.name.includes(this.state.filter));
    const subsAndStreams = filteredStreams.map(x => ({
      ...x,
      subscribed: subscriptions.some(s => s.stream_id === x.stream_id),
    }));

    return (
      <StreamList
        streams={subsAndStreams}
        showSwitch
        showDescriptions
        onSwitch={this.handleSwitchChange}
        onPress={nullFunction}
        clearInput={this.clearInput}
      />
    );
  }
}
