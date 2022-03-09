/* @flow strict-local */
import React, { useContext, useMemo } from 'react';
import type { Node } from 'react';
import { Image } from 'react-native';
import { createIconSet } from 'react-native-vector-icons';

import type { EmojiType } from '../types';
import { createStyleSheet, ThemeContext } from '../styles';
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
  size?: number,
|}>;

export default function Emoji(props: Props): Node {
  const { code, size = 20 } = props;
  const { color } = useContext(ThemeContext);
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
  return (
    <UnicodeEmoji
      // Set `color` just to remove some transparency or darkening that's
      // somehow getting applied, at least on Android, making emojis
      // noticeably faded; not sure how. See a screenshot of the faded
      // appearance at
      //   https://github.com/zulip/zulip-mobile/pull/5277#issuecomment-1062504604
      // and the doc for this property at
      //   https://github.com/oblador/react-native-vector-icons#properties
      color={color}
      name={code}
      size={size}
    />
  );
}
