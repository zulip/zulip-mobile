/* @flow strict-local */
import React, { useContext, useMemo } from 'react';
import type { Node } from 'react';
import { Image } from 'react-native';

import type { EmojiType } from '../types';
import { createStyleSheet, ThemeContext } from '../styles';
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
      color={color}
      name={code}
      size={size}
    />
  );
}
