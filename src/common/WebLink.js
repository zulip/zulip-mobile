/* @flow strict-local */

import * as React from 'react';

import ZulipText from './ZulipText';
import { openLinkWithUserPreference } from '../utils/openLink';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings } from '../directSelectors';
import type { BoundedDiff } from '../generics';

type ZulipTextProps = $Exact<React$ElementConfig<typeof ZulipText>>;

type Props = $ReadOnly<{|
  ...BoundedDiff<
    ZulipTextProps,
    {|
      // Could accept `style`, just be sure to merge with web-link style.
      style: ZulipTextProps['style'],

      onPress: ZulipTextProps['onPress'],
    |},
  >,
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
  const { url, ...zulipTextProps } = props;

  const globalSettings = useGlobalSelector(getGlobalSettings);

  return (
    <ZulipText
      style={componentStyles.link}
      onPress={() => {
        openLinkWithUserPreference(url, globalSettings);
      }}
      {...zulipTextProps}
    />
  );
}
