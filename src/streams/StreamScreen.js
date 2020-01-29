/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Stream, Subscription } from '../types';
import { connectFlowFixMe } from '../react-redux';
import { delay } from '../utils/async';
import { OptionRow, Screen, ZulipButton } from '../common';
import { getIsAdmin, getStreamForId, getSubscriptionForId } from '../selectors';
import StreamCard from './StreamCard';
import { IconPin, IconMute, IconNotifications, IconEdit, IconPlusSquare } from '../common/Icons';
import {
  toggleMuteStream,
  togglePinStream,
  navigateToEditStream,
  toggleStreamNotification,
  navigateToStreamSubscribers,
} from '../actions';
import styles from '../styles';

type SelectorProps = $ReadOnly<{|
  isAdmin: boolean,
  stream: Stream,
  subscription: Subscription,
|}>;

type Props = $ReadOnly<{|
  dispatch: Dispatch,

  ...SelectorProps,
|}>;

class StreamScreen extends PureComponent<Props> {
  handleTogglePinStream = (newValue: boolean) => {
    const { dispatch, stream } = this.props;
    dispatch(togglePinStream(stream.stream_id, newValue));
  };

  handleToggleMuteStream = (newValue: boolean) => {
    const { dispatch, stream } = this.props;
    dispatch(toggleMuteStream(stream.stream_id, newValue));
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
          Icon={IconPin}
          label="Pinned"
          value={subscription.pin_to_top}
          onValueChange={this.handleTogglePinStream}
        />
        <OptionRow
          Icon={IconMute}
          label="Muted"
          value={subscription.in_home_view === false}
          onValueChange={this.handleToggleMuteStream}
        />
        <OptionRow
          Icon={IconNotifications}
          label="Notifications"
          value={subscription.push_notifications}
          onValueChange={this.toggleStreamPushNotification}
        />
        <View style={styles.padding}>
          {isAdmin && (
            <ZulipButton
              style={styles.marginTop}
              Icon={IconEdit}
              text="Edit"
              secondary
              onPress={() => delay(this.handleEdit)}
            />
          )}
          <ZulipButton
            style={styles.marginTop}
            Icon={IconPlusSquare}
            text="Add subscribers"
            secondary
            onPress={() => delay(this.handleEditSubscribers)}
          />
        </View>
      </Screen>
    );
  }
}

export default connectFlowFixMe((state, props) => ({
  isAdmin: getIsAdmin(state),
  stream: getStreamForId(state, props.navigation.state.params.streamId),
  subscription: getSubscriptionForId(state, props.navigation.state.params.streamId),
}))(StreamScreen);
