/* @noflow */
import React, { PureComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import { SpinningProgress } from './';
import messageLoadingImg from '../../static/img/message-loading.png';

const styles = StyleSheet.create({
  row: {
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'absolute',
  },
});

type Props = {
  active: boolean,
  showLogo: boolean,
  size: number,
  backgroundColor: StyleObj,
};

export default class LoadingIndicator extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    active: false,
    showLogo: false,
    size: 40,
  };

  render() {
    const { active, showLogo, size } = this.props;

    return (
      <View style={styles.row}>
        <View>
          {active && <SpinningProgress size={size} thickness={4} />}
          {showLogo && (
            <Image
              style={[
                styles.logo,
                { width: size / 3 * 2, height: size / 3 * 2, marginTop: size / 6 },
              ]}
              source={messageLoadingImg}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    );
  }
}
