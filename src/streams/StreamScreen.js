/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, Clipboard } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import type { Dispatch, Stream, Subscription, GetText } from '../types';
import { connect } from '../react-redux';
import { delay } from '../utils/async';
import { OptionRow, Screen, ZulipButton, Label, Touchable } from '../common';
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
import styles, { BRAND_COLOR } from '../styles';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import { NULL_SUBSCRIPTION } from '../nullObjects';
import { showToast } from '../utils/info';
import { TranslationContext } from '../boot/TranslationProvider';

type SelectorProps = $ReadOnly<{|
  isAdmin: boolean,
  stream: Stream,
  subscription: Subscription,
  userSettingStreamNotification: boolean,
|}>;

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{ params: {| streamId: number |} }>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class StreamScreen extends PureComponent<Props> {
  static contextType = TranslationContext;
  context: GetText;

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
    const { dispatch, subscription, stream, userSettingStreamNotification } = this.props;
    const currentValue = subscription.push_notifications ?? userSettingStreamNotification;
    dispatch(toggleStreamNotification(stream.stream_id, !currentValue));
  };

  handleCopy = async emailAddress => {
    const _ = this.context;
    await Clipboard.setString(emailAddress);
    showToast(_('Copied email address'));
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
          <View style={styles.padding}>
            <Label style={[styles.marginTop, { fontSize: 16 }]} text="Email Address" />
          </View>
          <Touchable onPress={() => this.handleCopy(subscription.email_address)}>
            <Label
              style={[
                { borderColor: BRAND_COLOR, borderWidth: 1.5, borderRadius: 20, padding: 16 },
              ]}
              text={subscription.email_address}
            />
          </Touchable>
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
