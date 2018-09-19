/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { RawLabel, Touchable } from '../common';
import Emoji from '../emoji/Emoji';

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

type Props = {
  name: string,
  onPress: (name: string) => void,
};

export default class EmojiRow extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { name } = this.props;

    // TODO: this only handles Unicode emoji (shipped with the app),
    // not realm emoji or Zulip extra emoji.  See our issue #2846.
    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.emojiRow}>
          <Emoji name={name} size={20} />
          <RawLabel style={styles.text} text={name} />
        </View>
      </Touchable>
    );
  }
}
