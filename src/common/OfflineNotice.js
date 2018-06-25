/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { GlobalState } from '../types';
import { getSession } from '../selectors';
import { Label } from '../common';

import AnimatedComponent from '../animation/AnimatedComponent';

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    return (
      <AnimatedComponent
        property="height"
        useNativeDriver={false}
        visible={!isOnline}
        height={30}
        style={styles.block}
        delay={300}
      >
        {!isOnline && <Label style={styles.text} text="No Internet connection" />}
      </AnimatedComponent>
    );
  }
}

export default connect((state: GlobalState) => ({
  isOnline: getSession(state).isOnline,
}))(OfflineNotice);
