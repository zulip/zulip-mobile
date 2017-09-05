/* @flow */
import React, { PureComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import messageLoadingImg from '../../static/img/message-loading.png';
import AnimatedRotateComponent from '../animation/AnimatedRotateComponent';

const styles = StyleSheet.create({
  row: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    margin: 8,
  },
  semiCircle: {
    alignSelf: 'center',
    borderColor: 'black',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRadius: 100,
  },
  logo: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  line: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default class LoadingIndicator extends PureComponent {
  props: {
    active: boolean,
    caughtUp: boolean,
    size: number,
  };

  static defaultProps = {
    active: false,
    caughtUp: false,
    size: 32,
  };

  render() {
    const { active, caughtUp, size } = this.props;

    return (
      <View style={styles.row}>
        {caughtUp && <View style={styles.line} />}
        <View style={styles.loading}>
          {active && (
            <AnimatedRotateComponent
              style={[
                styles.semiCircle,
                { width: size, height: size, marginBottom: -size / 8 * 7 },
              ]}
            />
          )}
          <Image
            style={[styles.logo, { width: size / 4 * 3, height: size / 4 * 3 }]}
            source={messageLoadingImg}
            resizeMode="contain"
          />
        </View>
        {caughtUp && <View style={styles.line} />}
      </View>
    );
  }
}
