/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Dispatch } from '../types';
import { ZulipButton } from '../common';
import { navigateToAccountPicker } from '../actions';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 8,
  },
});

type Props = {|
  dispatch: Dispatch,
|};

class SwitchAccountButton extends PureComponent<Props> {
  switchAccount = () => {
    this.props.dispatch(navigateToAccountPicker());
  };

  render() {
    return (
      <ZulipButton
        style={styles.button}
        secondary
        text="Switch account"
        onPress={this.switchAccount}
      />
    );
  }
}

export default connect()(SwitchAccountButton);
