/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { CaughtUp, Narrow } from '../types';
import { getCaughtUpForNarrow } from '../selectors';
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
    padding: 2,
  },
});

type Props = {|
  narrow: Narrow,
  caughtUp: CaughtUp,
|};

class LoadingNotice extends PureComponent<Props> {
  render() {
    const { caughtUp } = this.props;
    const hasCaughtUp = caughtUp.newer;

    return (
      <AnimatedComponent
        stylePropertyName="height"
        fullValue={30}
        useNativeDriver={false}
        visible={!hasCaughtUp}
        style={styles.block}
      >
        {!hasCaughtUp && <Label style={styles.text} text="Connecting to server" />}
      </AnimatedComponent>
    );
  }
}

export default connect((state, props) => ({
  caughtUp: getCaughtUpForNarrow(state, props.narrow),
}))(LoadingNotice);
