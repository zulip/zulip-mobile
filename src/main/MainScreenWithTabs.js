/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import connectWithActions from '../connectWithActions';
import { getSettings } from '../selectors';

import { ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';

type Props = {
  theme: string,
};

class MainScreenWithTabs extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        <ZulipStatusBar />
        <MainTabs theme={this.props.theme} />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  theme: getSettings(state).theme,
}))(MainScreenWithTabs);
