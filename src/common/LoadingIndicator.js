/* @flow */
import React, { PureComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { SpinningProgress } from './';
import messageLoadingImg from '../../static/img/message-loading.png';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
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
  color: string,
  showLogo: boolean,
  size: number,
};

export default class LoadingIndicator extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    color: '82, 194, 175',
    showLogo: false,
    size: 40,
  };

  render() {
    const { color, showLogo, size } = this.props;

    return (
      <View style={styles.wrapper}>
        <View>
          <SpinningProgress color={color} size={size} thickness={Math.round(size / 20)} />
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
