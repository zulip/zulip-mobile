/* @flow */
import React, { PureComponent } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { RawLabel } from '../common';

const styles = StyleSheet.create({
  description: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 20,
  },
});

type Props = {
  name: string,
  iconUrl: string,
};

export default class RealmInfo extends PureComponent<Props> {
  props: Props;

  render() {
    const { name, iconUrl } = this.props;

    return (
      <View style={styles.description}>
        {iconUrl && <Image style={styles.icon} source={{ uri: iconUrl }} />}
        <RawLabel style={styles.name} text={name} />
      </View>
    );
  }
}
