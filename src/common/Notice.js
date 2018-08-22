/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { Label } from '.';

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
  text: string,
  visible: boolean,
};

/**
 * Generic notice with animated transition between shown/hidden states.
 *
 * @prop text - Provide the online/offline state.
 * @prop visible - Should the notice be shown. Use instead of conditionally
 * rendering the component use this prop to keep the animation.
 */
export default class Notice extends PureComponent<Props> {
  props: Props;

  render() {
    const { text, visible } = this.props;
    return (
      <AnimatedComponent
        property="height"
        useNativeDriver={false}
        visible={visible}
        height={30}
        style={styles.block}
        delay={300}
      >
        {visible && <Label style={styles.text} text={text} />}
      </AnimatedComponent>
    );
  }
}
