/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import config from '../config';
import { Screen } from '../common';
import InfoItem from './InfoItem';

export default class VariablesScreen extends PureComponent {
  render() {
    const variables = {
      enableReduxLogging: config.enableReduxLogging,
      enableReduxPerfLogging: config.enableReduxPerfLogging,
      enableSentry: config.enableSentry,
      enableNotifications: config.enableNotifications,
      'process.env.NODE_ENV': process.env.NODE_ENV,
      'global.btoa': !!global.btoa,
    };

    return (
      <Screen title="Variables">
        <FlatList
          data={Object.keys(variables)}
          keyExtractor={item => item}
          renderItem={({ item }) => <InfoItem label={item} value={variables[item]} />}
        />
      </Screen>
    );
  }
}
