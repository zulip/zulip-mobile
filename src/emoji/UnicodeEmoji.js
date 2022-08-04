/* @flow strict-local */
import React, { useContext, useMemo, type Node } from 'react';
import { Text } from 'react-native';

import { ThemeContext } from '../styles';
import { displayCharacterForUnicodeEmojiCode } from './data';

type Props = $ReadOnly<{|
  code: string,
  size: number,
|}>;

export default function UnicodeEmoji(props: Props): Node {
  const { code, size } = props;
  const { color } = useContext(ThemeContext);

  const style = useMemo(
    () => ({
      fontSize: size,

      // Set `color` just to remove some transparency or darkening that's
      // somehow getting applied, at least on Android, making emojis
      // noticeably faded; not sure how. See a screenshot of the faded
      // appearance at
      //   https://github.com/zulip/zulip-mobile/pull/5277#issuecomment-1062504604
      color,

      fontWeight: 'normal',
      fontStyle: 'normal',
    }),
    [color, size],
  );

  return (
    <Text selectable={false} allowFontScaling={false} style={style}>
      {displayCharacterForUnicodeEmojiCode(code)}
    </Text>
  );
}
