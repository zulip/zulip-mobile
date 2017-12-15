/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Stream, Subscription } from '../types';
import connectWithActions from '../connectWithActions';
import { OptionRow, Screen, ZulipButton } from '../common';
import { getStreams, getSubscriptions } from '../selectors';
import { NULL_SUBSCRIPTION } from '../nullObjects';
import StreamCard from './StreamCard';

type Props = {
  actions: Actions,
  navigation: Object,
  streams: Stream[],
  subscriptions: Subscription[],
};

class StreamScreen extends PureComponent<Props> {
  props: Props;

  handleTogglePinStream = (newValue: boolean) => {
    const { actions, navigation } = this.props;
    const { streamId } = navigation.state.params;
    actions.doTogglePinStream(streamId, newValue);
  };

  handleEdit = () => {
    const { actions, navigation } = this.props;
    actions.navigateToEditStream(navigation.state.params.streamId);
  };

  render() {
    const { streams, subscriptions, navigation } = this.props;
    const { streamId } = navigation.state.params;
    const stream = streams.find(x => x.stream_id === streamId);
    const subscription = subscriptions.find(x => x.stream_id === streamId) || NULL_SUBSCRIPTION;

    return (
      <Screen title="Stream" padding>
        <StreamCard stream={stream} subscription={subscription} />
        <OptionRow
          label="Pinned"
          defaultValue={subscription.pin_to_top}
          onValueChange={this.handleTogglePinStream}
        />
        <ZulipButton text="Edit" onPress={this.handleEdit} />
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  streams: getStreams(state),
  subscriptions: getSubscriptions(state),
}))(StreamScreen);
