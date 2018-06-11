/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, Dispatch, Stream, Subscription } from '../types';
import { OptionRow, Screen, ZulipButton, OptionDivider } from '../common';
import { getIsAdmin, getStreams, getSubscriptions } from '../selectors';
import { NULL_STREAM, NULL_SUBSCRIPTION } from '../nullObjects';
import StreamCard from './StreamCard';
import {
  doToggleMuteStream,
  doTogglePinStream,
  navigateToEditStream,
  navigateToTopicList,
  toggleStreamNotification,
} from '../actions';

type Props = {
  dispatch: Dispatch,
  isAdmin: boolean,
  navigation: Object,
  streams: Stream[],
  subscriptions: Subscription[],
};

class StreamScreen extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };
  handleTogglePinStream = (newValue: boolean) => {
    const { dispatch, navigation } = this.props;
    const { streamId } = navigation.state.params;
    dispatch(doTogglePinStream(streamId, newValue));
  };

  handleToggleMuteStream = (newValue: boolean) => {
    const { dispatch, navigation } = this.props;
    const { streamId } = navigation.state.params;
    dispatch(doToggleMuteStream(streamId, newValue));
  };

  handleTopics = () => {
    const { dispatch, navigation } = this.props;
    dispatch(navigateToTopicList(navigation.state.params.streamId));
  };

  handleEdit = () => {
    const { dispatch, navigation } = this.props;
    dispatch(navigateToEditStream(navigation.state.params.streamId));
  };

  toggleStreamPushNotification = () => {
    const { subscriptions, navigation, dispatch } = this.props;
    const { streamId } = navigation.state.params;
    const subscription = subscriptions.find(x => x.stream_id === streamId) || NULL_SUBSCRIPTION;
    dispatch(toggleStreamNotification(streamId, !subscription.push_notifications));
  };

  render() {
    const { isAdmin, streams, subscriptions, navigation } = this.props;
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
          defaultValue={subscription.in_home_view === false}
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
          {isAdmin && (
            <ZulipButton style={styles.marginTop} text="Edit" onPress={this.handleEdit} />
          )}
        </View>
      </Screen>
    );
  }
}

export default connect(state => ({
  isAdmin: getIsAdmin(state),
  streams: getStreams(state),
  subscriptions: getSubscriptions(state),
}))(StreamScreen);
