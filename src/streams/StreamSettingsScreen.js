/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Auth, Dispatch, Stream, Subscription } from '../types';
import { connect } from '../react-redux';
import { delay } from '../utils/async';
import { OptionRow, Screen, ZulipButton } from '../common';
import { getSettings } from '../directSelectors';
import { getAuth, getIsAdmin, getStreamForId } from '../selectors';
import StreamCard from './StreamCard';
import { IconPin, IconMute, IconNotifications, IconEdit, IconPlusSquare } from '../common/Icons';
import {
  setSubscriptionProperty,
  navigateToEditStream,
  navigateToStreamSubscribers,
} from '../actions';
import styles from '../styles';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import * as api from '../api';

type SelectorProps = $ReadOnly<{|
  auth: Auth,
  isAdmin: boolean,
  stream: Stream,
  subscription?: Subscription,
  userSettingStreamNotification: boolean,
|}>;

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'stream-settings'>,
  route: RouteProp<'stream-settings', {| streamId: number |}>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class StreamSettingsScreen extends PureComponent<Props> {
  handleTogglePinStream = (newValue: boolean) => {
    const { dispatch, stream } = this.props;
    dispatch(setSubscriptionProperty(stream.stream_id, 'pin_to_top', newValue));
  };

  handleToggleMuteStream = (newValue: boolean) => {
    const { dispatch, stream } = this.props;
    dispatch(setSubscriptionProperty(stream.stream_id, 'is_muted', newValue));
  };

  handleEdit = () => {
    const { stream } = this.props;
    NavigationService.dispatch(navigateToEditStream(stream.stream_id));
  };

  handleEditSubscribers = () => {
    const { stream } = this.props;
    NavigationService.dispatch(navigateToStreamSubscribers(stream.stream_id));
  };

  handleSubscribe = () => {
    const { auth, stream } = this.props;
    api.subscriptionAdd(auth, [{ name: stream.name }]);
  };

  handleUnsubscribe = () => {
    const { auth, stream } = this.props;
    api.subscriptionRemove(auth, [stream.name]);
  };

  toggleStreamPushNotification = () => {
    const { dispatch, subscription, stream, userSettingStreamNotification } = this.props;
    const currentValue = subscription?.push_notifications ?? userSettingStreamNotification;
    dispatch(setSubscriptionProperty(stream.stream_id, 'push_notifications', !currentValue));
  };

  render() {
    const { isAdmin, stream, subscription, userSettingStreamNotification } = this.props;

    return (
      <Screen title="Stream">
        <StreamCard stream={stream} subscription={subscription} />
        {subscription && (
          <>
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
          </>
        )}
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
          {subscription ? (
            <ZulipButton
              style={styles.marginTop}
              text="Unsubscribe"
              secondary
              onPress={() => delay(this.handleUnsubscribe)}
            />
          ) : (
            <ZulipButton
              style={styles.marginTop}
              text="Subscribe"
              secondary
              onPress={() => delay(this.handleSubscribe)}
            />
          )}
        </View>
      </Screen>
    );
  }
}

export default connect((state, props) => ({
  auth: getAuth(state),
  isAdmin: getIsAdmin(state),
  stream: getStreamForId(state, props.route.params.streamId),
  subscription: getSubscriptionsById(state).get(props.route.params.streamId),
  userSettingStreamNotification: getSettings(state).streamNotification,
}))(StreamSettingsScreen);
