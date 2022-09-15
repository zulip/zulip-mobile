/* @flow strict-local */

import * as React from 'react';

import ZulipText from './ZulipText';
import ZulipTextIntl from './ZulipTextIntl';
import { openLinkEmbedded } from '../utils/openLink';
import { BRAND_COLOR, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  ...$Exact<React$ElementConfig<typeof ZulipText>>,
  url: URL,
|}>;

const componentStyles = createStyleSheet({
  link: {
    color: BRAND_COLOR,
  },
});

/**
 * A button styled like a web link.
 *
 * Accepts `ZulipText`s, `ZulipTextIntl`s, and strings as children.
 *
 * Note: This sort of messes in those non-string children's business by
 *   unsetting some of their default style attributes. It does this so that
 *   its own special formatting can be passed down through the limited style
 *   inheritance that RN supports:
 *     https://reactnative.dev/docs/text#limited-style-inheritance
 *   See `aggressiveDefaultStyle` in ZulipText.
 *
 * TODO: Possibly there's a better way handle this.
 */
export default function WebLink(props: Props): React.Node {
  const { children } = props;

  return (
    <ZulipText
      style={componentStyles.link}
      onPress={() => {
        openLinkEmbedded(props.url.toString());
      }}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) {
          // Some React node that isn't a React element (a `React.Element`);
          // e.g., a plain string. The enclosing ZulipText will apply its
          // styles directly.
          return child;
        }
        // `child` should be a React.Element at this point. Docs are very
        // vague, but this sounds like it should be true, and it seems true
        // empirically. Would at least be good to have better type checking.

        if (child.type !== ZulipText && child.type !== ZulipTextIntl) {
          return child;
        }
        // These element types will have a style prop that we want to add to.

        return React.cloneElement(child, {
          style: {
            // Defeat ZulipText's aggressiveDefaultStyle.color so that our
            // color gets applied.
            color: undefined,
          },
        });
      })}
    </ZulipText>
  );
}
