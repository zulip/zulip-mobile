/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import connectWithActions from '../connectWithActions';
import { Label } from '../common';

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FD3D26',
  },
  text: {
    fontSize: 14,
    color: 'white',
  },
});

type Props = {
  isOnline: boolean,
};

class OfflineNotice extends PureComponent<Props> {
  props: Props;

  render() {
    const { isOnline } = this.props;

    if (isOnline) return null;

    return (
      <View style={styles.block}>
        <Label style={styles.text} text="No Internet connection" />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  isOnline: state.app.isOnline,
}))(OfflineNotice);
