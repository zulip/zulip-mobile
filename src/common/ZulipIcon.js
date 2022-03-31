// @flow strict-local
import React, { type Node } from 'react';
import { Text, View } from 'react-native';

// eslint-disable-next-line import/extensions
import codePointMap from '../../static/assets/fonts/zulip-icons.map.js';

type Props = $ReadOnly<{|
  ...$Exact<React$ElementConfig<typeof Text>>,
  name: $Keys<typeof codePointMap>,
  size: number,
  color?: string,
|}>;

/** The icons font. */
const fontFamily = 'zulip-icons';

/**
 * An icon from Zulip's custom icons.
 *
 * This component provides the same icons that are written in the web app
 * with CSS class `zulip-icon`.
 *
 * Specifically, where the web app writes
 *   `<i class="zulip-icon zulip-icon-SOMETHING" …></i>`,
 * one can get the same icon here by writing
 *   `<ZulipIcon name='SOMETHING' />`.
 *
 * These icons come from the Zulip shared package, `@zulip/shared` on NPM;
 * they're `static/shared/icons/*.svg` in the zulip.git tree.  For more
 * background, see `tools/build-icon-font`.
 *
 * This component accepts all `Text` style props, which it passes to an
 * internal `Text` component.  But it does not inherit text styles from its
 * parent.  If you want some style that's also present on the parent, pass
 * it explicitly.
 */
export default function ZulipIcon(props: Props): Node {
  const { name, size, color, style: styleOuter, ...restProps } = props;

  const codePoint = codePointMap[name];
  const glyph = codePoint == null ? '🚧 ICON MISSING 🚧' : String.fromCodePoint(codePoint);

  const style = [styleOuter, { fontFamily, fontSize: size, color }];
  return (
    <View>
      {/* The wrapper View ensures we don't inherit text styles:
            https://reactnative.dev/docs/text#nested-text
          In particular, inheriting `fontWeight: 'bold'` or `fontStyle: 'italic'`
          would result in not finding a glyph for the icon in the font. */}
      <Text selectable={false} style={style} {...restProps}>
        {glyph}
      </Text>
    </View>
  );
}
