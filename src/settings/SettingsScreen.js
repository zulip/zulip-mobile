/* @flow strict-local */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import SettingsCard from './SettingsCard';

export default class SettingsScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Settings">
        <SettingsCard />
      </Screen>
    );
  }
}
