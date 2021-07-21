/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

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

export default function EmojiRow(props: Props): Node {
  const { code, name, type, onPress } = props;

  const handlePress = useCallback(() => {
    onPress(name);
  }, [onPress, name]);

  return (
    <Touchable onPress={handlePress}>
      <View style={styles.emojiRow}>
        <Emoji code={code} type={type} />
        <RawLabel style={styles.text} text={name} />
      </View>
    </Touchable>
  );
}
