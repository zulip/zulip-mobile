/* @flow */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { ZulipButton } from '../common';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 8,
  },
});

class SwitchAccountButton extends Component {

  static contextTypes = {
    drawer: () => null,
  };

  switchAccount = () => {
    const { navigateToAccountPicker } = this.props;

    this.context.drawer.close();
    navigateToAccountPicker();
  }

  render() {
    return (
      <ZulipButton
        style={styles.button}
        secondary
        text="Switch"
        onPress={this.switchAccount}
      />
    );
  }
}

export default connect(
  () => ({}),
  boundActions,
)(SwitchAccountButton);
