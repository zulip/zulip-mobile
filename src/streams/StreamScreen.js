/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions, Stream, Subscription } from '../types';
import connectWithActions from '../connectWithActions';
import { OptionRow, Screen, ZulipButton, OptionDivider } from '../common';
import { getStreams, getSubscriptions } from '../selectors';
import { NULL_STREAM, NULL_SUBSCRIPTION } from '../nullObjects';
import StreamCard from './StreamCard';

type Props = {
  actions: Actions,
  navigation: Object,
  streams: Stream[],
  subscriptions: Subscription[],
};

class StreamScreen extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleTogglePinStream = (newValue: boolean) => {
    const { actions, navigation } = this.props;
    const { streamId } = navigation.state.params;
    actions.doTogglePinStream(streamId, newValue);
  };

  handleToggleMuteStream = (newValue: boolean) => {
    const { actions, navigation } = this.props;
    const { streamId } = navigation.state.params;
    actions.doToggleMuteStream(streamId, newValue);
  };

  handleTopics = () => {
    const { actions, navigation } = this.props;
    actions.navigateToTopicList(navigation.state.params.streamId);
  };

  handleEdit = () => {
    const { actions, navigation } = this.props;
    actions.navigateToEditStream(navigation.state.params.streamId);
  };

  toggleStreamPushNotification = () => {
    const { subscriptions, navigation, actions } = this.props;
    const { streamId } = navigation.state.params;
    const subscription = subscriptions.find(x => x.stream_id === streamId) || NULL_SUBSCRIPTION;
    actions.toggleStreamNotification(streamId, !subscription.push_notifications);
  };

  render() {
    const { streams, subscriptions, navigation } = this.props;
    const { streamId } = navigation.state.params;
    const stream = streams.find(x => x.stream_id === streamId) || NULL_STREAM;
    const subscription = subscriptions.find(x => x.stream_id === streamId) || NULL_SUBSCRIPTION;
    const { styles } = this.context;

    return (
      <Screen title="Stream">
        <StreamCard stream={stream} subscription={subscription} />
        <OptionRow
          label="Pinned"
          defaultValue={subscription.pin_to_top}
          onValueChange={this.handleTogglePinStream}
        />
        <OptionRow
          label="Muted"
          defaultValue={stream.in_home_view === false}
          onValueChange={this.handleToggleMuteStream}
        />
        <OptionRow
          label="Notifications"
          defaultValue={subscription.push_notifications}
          onValueChange={this.toggleStreamPushNotification}
          customStyle={this.context.styles.backgroundColor}
        />
        <OptionDivider />
        <View style={styles.padding}>
          <ZulipButton text="Topics" onPress={this.handleTopics} />
          <ZulipButton style={styles.marginTop} text="Edit" onPress={this.handleEdit} />
        </View>
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  streams: getStreams(state),
  subscriptions: getSubscriptions(state),
}))(StreamScreen);
