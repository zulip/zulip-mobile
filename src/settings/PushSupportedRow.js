/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label } from '../common';
import type { Auth } from '../types';
import { getServerSettings } from '../api';

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
  },
});

type Props = {
  realm: string,
};

type State = {
  push_notifications_enabled: boolean | 'loading' | null,
};

export default class PushSupportedRow extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = {
    push_notifications_enabled: 'loading',
  };

  componentDidMount() {
    this.fetchNotificationSettings();
  }

  fetchNotificationSettings = async () => {
    const { realm } = this.props;
    const data = await getServerSettings(realm);
    this.setState({
      push_notifications_enabled:
        'push_notifications_enabled' in data ? data.push_notifications_enabled : null,
    });
  };

  render() {
    const { push_notifications_enabled: pushNotifEn } = this.state;

    return (
      <View style={[styles.optionRow]}>
        {pushNotifEn === true && <Label text="Push Notifications are working on server" />}
        {pushNotifEn === false && (
          <Label text="Push notifications not configured on server, please contact Admin" />
        )}
        {pushNotifEn === null && (
          <Label text="Cannot fetch push notifications settings from server" />
        )}
        {pushNotifEn === 'loading' && (
          <Label text="Fetching push notifications settings from the server" />
        )}
      </View>
    );
  }
}
