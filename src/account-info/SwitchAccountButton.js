import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { ZButton } from '../common';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    marginTop: 10,
  },
});

class SwitchAccountButton extends Component {

  static contextTypes = {
    drawer: () => null,
  };

  switchAccount = () => {
    this.context.drawer.close();
    this.props.pushRoute('account');
  }

  render() {
    return (
      <ZButton
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
