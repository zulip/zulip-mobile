/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import { getSession } from '../selectors';
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

/**
 * Displays a notice that the app is working in offline mode.
 * Not rendered if state is 'online'.
 *
 * @prop isOnline - Provide the online/offline state.
 */
class OfflineNotice extends PureComponent<Props> {
  props: Props;

  render() {
    const { isOnline } = this.props;

    if (isOnline) {
      return null;
    }

    return (
      <View style={styles.block}>
        <Label style={styles.text} text="No Internet connection" />
      </View>
    );
  }
}

export default connect(state => ({
  isOnline: getSession(state).isOnline,
}))(OfflineNotice);
