/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { GlobalState, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getSession } from '../selectors';
import Label from './Label';

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

type Props = {|
  dispatch: Dispatch,
  isOnline: boolean,
|};

/**
 * Displays a notice that the app is working in offline mode.
 * Not rendered if state is 'online'.
 *
 * @prop isOnline - Provide the online/offline state.
 */
class OfflineNotice extends PureComponent<Props> {
  render() {
    const { isOnline } = this.props;
    return (
      <AnimatedComponent
        stylePropertyName="height"
        fullValue={30}
        useNativeDriver={false}
        visible={!isOnline}
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
