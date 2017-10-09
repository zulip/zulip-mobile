/* TODO flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import SettingsContainer from './SettingsContainer';

export default class SettingsScreen extends PureComponent<void> {
  render() {
    return (
      <Screen title="Settings">
        <SettingsContainer />
      </Screen>
    );
  }
}
