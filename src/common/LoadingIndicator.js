/* @noflow */
import React, { PureComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import * as Progress from 'react-native-progress';

import type { StyleObj } from '../types';
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
  line: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'black',
  },
});

type Props = {
  active: boolean,
  size: number,
  backgroundColor: StyleObj,
};

export default class LoadingIndicator extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    active: false,
    caughtUp: false,
    size: 40,
  };

  render() {
    const { active, caughtUp, size } = this.props;

    return (
      <View style={styles.row}>
        <View>
          {active && (
            <View>
              <Progress.CircleSnail color="black" size={size} thickness={2} />
            </View>
          )}
          <Image
            style={[styles.logo, { width: size / 2, height: size / 2, marginTop: size / 4 }]}
            source={messageLoadingImg}
            resizeMode="contain"
          />
        </View>
        {caughtUp && <View style={styles.line} />}
      </View>
    );
  }
}
