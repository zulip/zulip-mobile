/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Screen } from '../common';
import config from '../config';
import InfoItem from './InfoItem';

export default class NotificationDiagScreen extends PureComponent<{||}> {
  render() {
    const variables = {
      'Initial notification': JSON.stringify(config.startup.notification),
    };
    return (
      <Screen title="Notification Diagnostics" scrollEnabled={false}>
        <FlatList
          data={Object.keys(variables)}
          keyExtractor={item => item}
          renderItem={({ item }) => <InfoItem label={item} value={variables[item]} />}
        />
      </Screen>
    );
  }
}
