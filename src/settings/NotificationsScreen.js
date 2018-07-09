/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Auth, Dispatch } from '../types';
import { getAuth, getSettings } from '../selectors';
import { OptionRow, Screen } from '../common';
import { toggleMobilePushSettings } from '../api';
import { settingsChange } from '../actions';
import PushSupportedRow from './PushSupportedRow';

type Props = {
  auth: Auth,
  dispatch: Dispatch,
  offlineNotification: boolean,
  onlineNotification: boolean,
  streamNotification: boolean,
};

class NotificationsScreen extends PureComponent<Props> {
  props: Props;

  handleOfflineNotificationChange = () => {
    const { auth, dispatch, offlineNotification } = this.props;
    toggleMobilePushSettings({
      auth,
      opp: 'offline_notification_change',
      value: !offlineNotification,
    });
    dispatch(settingsChange('offlineNotification', !offlineNotification));
  };

  handleOnlineNotificationChange = () => {
    const { auth, dispatch, onlineNotification } = this.props;
    toggleMobilePushSettings({
      auth,
      opp: 'online_notification_change',
      value: !onlineNotification,
    });
    dispatch(settingsChange('onlineNotification', !onlineNotification));
  };

  handleStreamNotificationChange = () => {
    const { auth, dispatch, streamNotification } = this.props;
    toggleMobilePushSettings({
      auth,
      opp: 'stream_notification_change',
      value: !streamNotification,
    });
    dispatch(settingsChange('streamNotification', !streamNotification));
  };

  render() {
    const { offlineNotification, onlineNotification, streamNotification, auth } = this.props;

    return (
      <Screen title="Notifications">
        <OptionRow
          label="Notifications when offline"
          defaultValue={offlineNotification}
          onValueChange={this.handleOfflineNotificationChange}
        />
        <OptionRow
          label="Notifications when online"
          defaultValue={onlineNotification}
          onValueChange={this.handleOnlineNotificationChange}
        />
        <OptionRow
          label="Stream notifications"
          defaultValue={streamNotification}
          onValueChange={this.handleStreamNotificationChange}
        />
        <PushSupportedRow realm={auth.realm} />
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
