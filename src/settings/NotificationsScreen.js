/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Account, Dispatch, GlobalState } from '../types';
import { getActiveAccount, getSettings } from '../selectors';
import { OptionRow, Screen } from '../common';
import { toggleMobilePushSettings } from '../api';
import { settingsChange } from '../actions';

type Props = {
  account: Account,
  dispatch: Dispatch,
  offlineNotification: boolean,
  onlineNotification: boolean,
  streamNotification: boolean,
};

class NotificationsScreen extends PureComponent<Props> {
  props: Props;

  handleOfflineNotificationChange = () => {
    const { account, dispatch, offlineNotification } = this.props;
    toggleMobilePushSettings({
      account,
      opp: 'offline_notification_change',
      value: !offlineNotification,
    });
    dispatch(settingsChange('offlineNotification', !offlineNotification));
  };

  handleOnlineNotificationChange = () => {
    const { account, dispatch, onlineNotification } = this.props;
    toggleMobilePushSettings({
      account,
      opp: 'online_notification_change',
      value: !onlineNotification,
    });
    dispatch(settingsChange('onlineNotification', !onlineNotification));
  };

  handleStreamNotificationChange = () => {
    const { account, dispatch, streamNotification } = this.props;
    toggleMobilePushSettings({
      account,
      opp: 'stream_notification_change',
      value: !streamNotification,
    });
    dispatch(settingsChange('streamNotification', !streamNotification));
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

export default connect((state: GlobalState) => ({
  account: getActiveAccount(state),
  offlineNotification: getSettings(state).offlineNotification,
  onlineNotification: getSettings(state).onlineNotification,
  streamNotification: getSettings(state).streamNotification,
}))(NotificationsScreen);
