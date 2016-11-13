import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Button } from '../common';

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
  },
});

class SwitchAccountButton extends Component {

  switchAccount = () =>
    this.props.pushRoute({ key: 'accountlist' });

  render() {
    return (
      <Button
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
