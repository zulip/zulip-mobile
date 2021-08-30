/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Image } from 'react-native';
import { createIconSet } from 'react-native-vector-icons';

import type { EmojiType } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getAllImageEmojiByCode } from './emojiSelectors';
import { codeToEmojiMap } from './data';

/* $FlowFixMe[incompatible-call]: `createIconSet` is mistyped
  upstream; elements of `glyphMap` may be either `number` or `string`.
  */
const UnicodeEmoji = createIconSet(codeToEmojiMap);

type Props = $ReadOnly<{|
  type: EmojiType,
  code: string,
|}>;

const componentStyles = createStyleSheet({
  image: { width: 20, height: 20 },
});

export default function Emoji(props: Props): Node {
  const { code } = props;
  const imageEmoji = useSelector(state =>
    props.type === 'image' ? getAllImageEmojiByCode(state)[props.code] : undefined,
  );
  if (imageEmoji) {
    return <Image style={componentStyles.image} source={{ uri: imageEmoji.source_url }} />;
  }
  return <UnicodeEmoji name={code} size={20} />;
}
