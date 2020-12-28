/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, Image } from 'react-native';

import { RawLabel } from '../common';
import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
  description: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  name: {
    fontSize: 20,
  },
});

type Props = $ReadOnly<{|
  name: string,
  iconUrl: string,
|}>;

export default class RealmInfo extends PureComponent<Props> {
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
