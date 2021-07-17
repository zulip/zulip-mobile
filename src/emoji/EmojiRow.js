/* @flow strict-local */
import React, { PureComponent } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { EmojiType } from '../types';
import { createStyleSheet } from '../styles';
import { RawLabel, Touchable } from '../common';
import Emoji from './Emoji';

const styles = createStyleSheet({
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

/**
 * A list item for an emoji, e.g., for autocomplete or the reaction picker.
 *
 * Pads the horizontal insets with its background.
 */
export default class EmojiRow extends PureComponent<Props> {
  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { code, name, type } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.emojiRow}>
          <Emoji code={code} type={type} />
          <RawLabel style={styles.text} text={name} />
        </SafeAreaView>
      </Touchable>
    );
  }
}
