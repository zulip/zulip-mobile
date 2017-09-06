/* TODO flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../selectors';
import { Screen } from '../common';
import SettingsCard from './SettingsCard';

class SettingsScreen extends PureComponent {
  render() {
    return (
      <Screen title="Settings">
        <SettingsCard {...this.props} />
      </Screen>
    );
  }
}

export default connect(
  state => ({
    offlineNotification: state.settings.offlineNotification,
    onlineNotification: state.settings.onlineNotification,
    theme: state.settings.theme,
    auth: getAuth(state),
  }),
  boundActions,
)(SettingsScreen);
