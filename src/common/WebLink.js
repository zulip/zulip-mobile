/* @flow strict-local */

import * as React from 'react';

import ZulipText from './ZulipText';
import { openLinkWithUserPreference } from '../utils/openLink';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings } from '../directSelectors';

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
 * Accepts strings as children or a `text` prop, just like ZulipText.
 *
 * Also accepts `ZulipText`s and `ZulipTextIntl`s as children. To keep the
 * special formatting, you have to pass `inheritColor` to those.
 */
export default function WebLink(props: Props): React.Node {
  const { children } = props;

  const globalSettings = useGlobalSelector(getGlobalSettings);

  return (
    <ZulipText
      style={componentStyles.link}
      onPress={() => {
        openLinkWithUserPreference(props.url.toString(), globalSettings);
      }}
    >
      {children}
    </ZulipText>
  );
}
