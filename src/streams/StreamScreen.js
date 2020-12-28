/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, Stream, Subscription } from '../types';
import { connect } from '../react-redux';
import { delay } from '../utils/async';
import { OptionRow, Screen, ZulipButton } from '../common';
import { getSettings } from '../directSelectors';
import { getIsAdmin, getStreamForId } from '../selectors';
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
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import { NULL_SUBSCRIPTION } from '../nullObjects';

type SelectorProps = $ReadOnly<{|
  isAdmin: boolean,
  stream: Stream,
  subscription: Subscription,
  userSettingStreamNotification: boolean,
|}>;

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<{|
    ...NavigationStateRoute,
    params: {| streamId: number |},
  |}>,

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
    const { stream } = this.props;
    NavigationService.dispatch(navigateToEditStream(stream.stream_id));
  };

  handleEditSubscribers = () => {
    const { stream } = this.props;
    NavigationService.dispatch(navigateToStreamSubscribers(stream.stream_id));
  };

  toggleStreamPushNotification = () => {
    const { dispatch, subscription, stream, userSettingStreamNotification } = this.props;
    const currentValue = subscription.push_notifications ?? userSettingStreamNotification;
    dispatch(toggleStreamNotification(stream.stream_id, !currentValue));
  };

  render() {
    const { isAdmin, stream, subscription, userSettingStreamNotification } = this.props;

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
          value={subscription.push_notifications ?? userSettingStreamNotification}
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

export default connect((state, props) => ({
  isAdmin: getIsAdmin(state),
  stream: getStreamForId(state, props.navigation.state.params.streamId),
  subscription:
    getSubscriptionsById(state).get(props.navigation.state.params.streamId) || NULL_SUBSCRIPTION,
  userSettingStreamNotification: getSettings(state).streamNotification,
}))(StreamScreen);
