/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Auth, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getAuth, getSettings } from '../selectors';
import { OptionRow, Screen } from '../common';
import * as api from '../api';
import { settingsChange } from '../actions';

type Props = $ReadOnly<{|
  // Since we've put this screen in AppNavigator's route config, and
  // we don't invoke it without type-checking anywhere else (in fact,
  // we don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
  navigation: AppNavigationProp<'notifications'>,

  auth: Auth,
  dispatch: Dispatch,
  offlineNotification: boolean,
  onlineNotification: boolean,
  streamNotification: boolean,
|}>;

class NotificationsScreen extends PureComponent<Props> {
  handleOfflineNotificationChange = () => {
    const { auth, dispatch, offlineNotification } = this.props;
    api.toggleMobilePushSettings({
      auth,
      opp: 'offline_notification_change',
      value: !offlineNotification,
    });
    dispatch(settingsChange({ offlineNotification: !offlineNotification }));
  };

  handleOnlineNotificationChange = () => {
    const { auth, dispatch, onlineNotification } = this.props;
    api.toggleMobilePushSettings({
      auth,
      opp: 'online_notification_change',
      value: !onlineNotification,
    });
    dispatch(settingsChange({ onlineNotification: !onlineNotification }));
  };

  handleStreamNotificationChange = () => {
    const { auth, dispatch, streamNotification } = this.props;
    api.toggleMobilePushSettings({
      auth,
      opp: 'stream_notification_change',
      value: !streamNotification,
    });
    dispatch(settingsChange({ streamNotification: !streamNotification }));
  };

  render() {
    const { offlineNotification, onlineNotification, streamNotification } = this.props;

    return (
      <Screen title="Notifications">
        <OptionRow
          label="Notifications when offline"
          value={offlineNotification}
          onValueChange={this.handleOfflineNotificationChange}
        />
        <OptionRow
          label="Notifications when online"
          value={onlineNotification}
          onValueChange={this.handleOnlineNotificationChange}
        />
        <OptionRow
          label="Stream notifications"
          value={streamNotification}
          onValueChange={this.handleStreamNotificationChange}
        />
      </Screen>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
  offlineNotification: getSettings(state).offlineNotification,
  onlineNotification: getSettings(state).onlineNotification,
  streamNotification: getSettings(state).streamNotification,
}))(NotificationsScreen);
