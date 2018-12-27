/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Context, GlobalState } from '../types';
import { getServerSettings } from '../api';
import { OfflineNotice, ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';
import styles from '../styles';
import CompatibilityScreen from '../start/CompatibilityScreen';
import { getAccounts } from '../selectors';
import SwitchAccountButton from '../account-info/SwitchAccountButton';

const componentStyles = StyleSheet.create({
  switchAccountButton: {
    alignSelf: 'center',
    position: 'absolute',
    top: 140,
    width: 250,
    height: 60,
  },
});

type Props = {|
  realm: string,
|};

type State = {|
  serverCompatibility: boolean,
|};

class MainScreenWithTabs extends PureComponent<Props, State> {
  context: Context;

  state = {
    serverCompatibility: true,
  };

  async componentDidMount() {
    const { realm } = this.props;
    const { is_incompatible } = await getServerSettings(realm);

    if (is_incompatible) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        serverCompatibility: false,
      });
    }
  }

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { serverCompatibility } = this.state;

    return serverCompatibility ? (
      <View style={[styles.flexed, contextStyles.backgroundColor]}>
        {/* $FlowFixMe-56 Cannot create ZulipStatusBar element because ST is not a React component. */}
        <ZulipStatusBar />
        <OfflineNotice />
        <MainTabs />
      </View>
    ) : (
      <CompatibilityScreen incompatibilityText={`This app is too old for \n${this.props.realm}.`}>
        <View style={componentStyles.switchAccountButton}>
          <SwitchAccountButton isOnCompatibilityScreen />
        </View>
      </CompatibilityScreen>
    );
  }
}

export default connect((state: GlobalState) => ({
  realm: getAccounts(state)[0].realm,
}))(MainScreenWithTabs);
