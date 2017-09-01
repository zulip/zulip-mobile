/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';

import config from '../config';
import { Screen } from '../common';
import InfoItem from './InfoItem';

export default class DiagnosticsScreen extends PureComponent {
  render() {
    return (
      <Screen title="Info">
        <ScrollView>
          <InfoItem label="enableReduxLogging" value={config.enableReduxLogging} />
          <InfoItem label="enableSentry" value={config.enableSentry} />
          <InfoItem label="enableNotifications" value={config.enableNotifications} />
          <InfoItem label="process.env.NODE_ENV" value={process.env.NODE_ENV} />
          <InfoItem label="global.btoa" value={!!global.btoa} />
        </ScrollView>
      </Screen>
    );
  }
}
