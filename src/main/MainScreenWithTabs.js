/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import type { Context, Auth } from '../types';
import { ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';
import { getAuth } from '../selectors';
import { showToast } from '../utils/info';
import config from '../config';

type Props = {
  auth: Auth,
};

class MainScreenWithTabs extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  componentWillMount() {
    if (config.startup.notification) {
      if (this.props.auth.realm.indexOf(config.startup.notification.server) < 0) {
        showToast('Notification is from a different realm.');
        config.startup.notification = undefined;
      }
    }
  }

  render() {
    const { styles } = this.context;

    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        <ZulipStatusBar />
        <MainTabs />
      </View>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
}))(MainScreenWithTabs);
