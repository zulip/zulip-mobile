/* @flow strict-local */
import React from 'react';
import { Image } from 'react-native';
import { createIconSet } from 'react-native-vector-icons';

import type { ImageEmojiType, Dispatch, EmojiType } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getAllImageEmojiByCode } from './emojiSelectors';
import { codeToEmojiMap } from './data';

/* $FlowFixMe[incompatible-call]: `createIconSet` is mistyped
  upstream; elements of `glyphMap` may be either `number` or `string`.
  */
const UnicodeEmoji = createIconSet(codeToEmojiMap);

type SelectorProps = {|
  imageEmoji: ImageEmojiType | void,
|};

type Props = $ReadOnly<{|
  type: EmojiType,
  code: string,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

const componentStyles = createStyleSheet({
  image: { width: 20, height: 20 },
});

function Emoji(props: Props) {
  const { code, imageEmoji } = props;
  if (imageEmoji) {
    return <Image style={componentStyles.image} source={{ uri: imageEmoji.source_url }} />;
  }
  return <UnicodeEmoji name={code} size={20} />;
}

export default connect<SelectorProps, _, _>((state, props) => ({
  imageEmoji: props.type === 'image' ? getAllImageEmojiByCode(state)[props.code] : undefined,
}))(Emoji);
