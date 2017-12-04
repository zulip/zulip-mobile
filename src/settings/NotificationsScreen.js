/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Auth } from '../types';
import connectWithActions from '../connectWithActions';
import { getAuth } from '../selectors';
import { OptionRow, Screen } from '../common';
import { toggleMobilePushSettings } from '../api';

type Props = {
  auth: Auth,
  actions: Actions,
  offlineNotification: boolean,
  onlineNotification: boolean,
  streamNotification: boolean,
};

class NotificationsScreen extends PureComponent<Props> {
  props: Props;

  handleOfflineNotificationChange = () => {
    const { actions, auth, offlineNotification } = this.props;
    toggleMobilePushSettings({
      auth,
      opp: 'offline_notification_change',
      value: !offlineNotification,
    });
    actions.settingsChange('offlineNotification', !offlineNotification);
  };

  handleOnlineNotificationChange = () => {
    const { actions, auth, onlineNotification } = this.props;
    toggleMobilePushSettings({
      auth,
      opp: 'online_notification_change',
      value: !onlineNotification,
    });
    actions.settingsChange('onlineNotification', !onlineNotification);
  };

  handleStreamNotificationChange = () => {
    const { actions, auth, streamNotification } = this.props;
    toggleMobilePushSettings({
      auth,
      opp: 'stream_notification_change',
      value: !streamNotification,
    });
    actions.settingsChange('streamNotification', !streamNotification);
  };

  render() {
    const { offlineNotification, onlineNotification, streamNotification } = this.props;

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
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  offlineNotification: state.settings.offlineNotification,
  onlineNotification: state.settings.onlineNotification,
  streamNotification: state.settings.streamNotification,
}))(NotificationsScreen);
