/* @flow strict-local */
import React, { useMemo } from 'react';
import type { Node } from 'react';
import { Image } from 'react-native';

import type { EmojiType } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getAllImageEmojiByCode } from './emojiSelectors';
import UnicodeEmoji from './UnicodeEmoji';

type Props = $ReadOnly<{|
  type: EmojiType,
  code: string,
  size?: number,
|}>;

export default function Emoji(props: Props): Node {
  const { code, size = 20 } = props;
  const imageEmoji = useSelector(state =>
    props.type === 'image' ? getAllImageEmojiByCode(state)[props.code] : undefined,
  );
  const componentStyles = useMemo(
    () => createStyleSheet({ image: { width: size, height: size } }),
    [size],
  );
  if (imageEmoji) {
    return <Image style={componentStyles.image} source={{ uri: imageEmoji.source_url }} />;
  }
  return <UnicodeEmoji code={code} size={size} />;
}
