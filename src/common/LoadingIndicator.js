/* @noflow */
import React, { PureComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import messageLoadingImg from '../../static/img/message-loading.png';
import AnimatedRotateComponent from '../animation/AnimatedRotateComponent';

const styles = StyleSheet.create({
  animatedComponent: {
    position: 'absolute',
  },
  row: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  semiCircle: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 100,
  },
  logo: {
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'absolute',
  },
  line: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'black',
  },
});

type Props = {
  active: boolean,
  caughtUp: boolean,
  size: number,
  backgroundColor: StyleObj,
};

export default class LoadingIndicator extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    active: false,
    caughtUp: false,
    size: 32,
  };

  render() {
    const { active, caughtUp, size, backgroundColor } = this.props;

    return (
      <View style={styles.row}>
        {caughtUp && <View style={styles.line} />}
        <View>
          {active && (
            <View>
              <View style={[styles.semiCircle, { height: size, width: size }]} />
              <AnimatedRotateComponent style={styles.animatedComponent}>
                <View
                  style={[{ marginTop: size / 2, height: size / 2, width: size }, backgroundColor]}
                />
              </AnimatedRotateComponent>
            </View>
          )}
          <Image
            style={[
              styles.logo,
              { width: size / 4 * 3, height: size / 4 * 3, marginTop: size / 8 },
            ]}
            source={messageLoadingImg}
            resizeMode="contain"
          />
        </View>
        {caughtUp && <View style={styles.line} />}
      </View>
    );
  }
}
