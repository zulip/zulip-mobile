/* @flow strict-local */
import React, { useMemo, type Node } from 'react';
import { Text } from 'react-native';

import { codeToEmojiMap } from './data';

type Props = $ReadOnly<{|
  name: string,
  size: number,
  color: string,
|}>;

export default function UnicodeEmoji(props: Props): Node {
  const { name, size, color } = props;

  const style = useMemo(
    () => ({
      fontSize: size,
      color,
      fontWeight: 'normal',
      fontStyle: 'normal',
    }),
    [color, size],
  );

  return (
    <Text selectable={false} allowFontScaling={false} style={style}>
      {codeToEmojiMap[name] || '?'}
    </Text>
  );
}
