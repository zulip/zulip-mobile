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

  switchAccount = () => {
    this.context.drawer.close();
    this.props.pushRoute('account');
  }

  render() {
    return (
      <ZulipButton
        customStyles={styles.button}
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
