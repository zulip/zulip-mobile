/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { EmojiType } from '../types';
import { RawLabel, Touchable } from '../common';
import Emoji from './Emoji';

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  text: {
    paddingLeft: 6,
  },
});

type Props = $ReadOnly<{|
  type: EmojiType,
  code: string,
  name: string,
  onPress: (name: string) => void,
|}>;

export default class EmojiRow extends PureComponent<Props> {
  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { code, name, type } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.emojiRow}>
          <Emoji code={code} type={type} />
          <RawLabel style={styles.text} text={name} />
        </View>
      </Touchable>
    );
  }
}
