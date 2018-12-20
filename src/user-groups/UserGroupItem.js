/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Context } from '../types';
import { IconPeople } from '../common/Icons';
import { RawLabel, Touchable } from '../common';
import styles from '../styles';

const componentStyles = StyleSheet.create({
  text: {
    marginLeft: 8,
  },
  textEmail: {
    fontSize: 10,
    color: '#999',
  },
  textWrapper: {
    flex: 1,
  },
});

type Props = {|
  name: string,
  description: string,
  onPress: (name: string) => void,
|};

export default class UserGroupItem extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { name, description } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.listItem}>
          <IconPeople size={32} />
          <View style={componentStyles.textWrapper}>
            <RawLabel
              style={componentStyles.text}
              text={name}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
            <RawLabel
              style={[componentStyles.text, componentStyles.textEmail]}
              text={description}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
          </View>
        </View>
      </Touchable>
    );
  }
}
