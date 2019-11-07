/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

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
  name: string,
  onPress: (name: string) => void,
|}>;

export default class EmojiRow extends PureComponent<Props> {
  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { name } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.emojiRow}>
          <Emoji name={name} />
          <RawLabel style={styles.text} text={name} />
        </View>
      </Touchable>
    );
  }
}
