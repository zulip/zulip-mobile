/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, GlobalState, Stream, Subscription } from '../types';
import { connectFlowFixMe } from '../react-redux';
import { delay } from '../utils/async';
import { OptionRow, Screen, ZulipButton, OptionDivider } from '../common';
import { getIsAdmin, getStreamFromId, getSubscriptionFromId } from '../selectors';
import StreamCard from './StreamCard';
import {
  doToggleMuteStream,
  doTogglePinStream,
  navigateToEditStream,
  navigateToTopicList,
  toggleStreamNotification,
  navigateToStreamSubscribers,
} from '../actions';
import styles from '../styles';

type Props = {|
  dispatch: Dispatch,
  isAdmin: boolean,
  stream: Stream,
  subscription: Subscription,
|};

class StreamScreen extends PureComponent<Props> {
  handleTogglePinStream = (newValue: boolean) => {
    const { dispatch, stream } = this.props;
    dispatch(doTogglePinStream(stream.stream_id, newValue));
  };

  handleToggleMuteStream = (newValue: boolean) => {
    const { dispatch, stream } = this.props;
    dispatch(doToggleMuteStream(stream.stream_id, newValue));
  };

  handleTopics = () => {
    const { dispatch, stream } = this.props;
    dispatch(navigateToTopicList(stream.stream_id));
  };

  handleEdit = () => {
    const { dispatch, stream } = this.props;
    dispatch(navigateToEditStream(stream.stream_id));
  };

  handleEditSubscribers = () => {
    const { dispatch, stream } = this.props;
    dispatch(navigateToStreamSubscribers(stream.stream_id));
  };

  toggleStreamPushNotification = () => {
    const { dispatch, subscription, stream } = this.props;
    dispatch(toggleStreamNotification(stream.stream_id, !subscription.push_notifications));
  };

  render() {
    const { isAdmin, stream, subscription } = this.props;

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
        />
        <OptionDivider />
        <View style={styles.padding}>
          <ZulipButton text="Topics" onPress={() => delay(this.handleTopics)} />
          {isAdmin && (
            <ZulipButton
              style={styles.marginTop}
              text="Edit"
              onPress={() => delay(this.handleEdit)}
            />
          )}
          <ZulipButton
            style={styles.marginTop}
            text="Add subscribers"
            onPress={() => delay(this.handleEditSubscribers)}
          />
        </View>
      </Screen>
    );
  }
}

export default connectFlowFixMe((state: GlobalState, props) => ({
  isAdmin: getIsAdmin(state),
  stream: getStreamFromId(state, props.navigation.state.params.streamId),
  subscription: getSubscriptionFromId(state, props.navigation.state.params.streamId),
}))(StreamScreen);
