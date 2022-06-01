/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';

import type { LocalizableText } from '../types';
import ZulipTextIntl from './ZulipTextIntl';
import { openLinkEmbedded } from '../utils/openLink';
import { BRAND_COLOR, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  label: LocalizableText,
  url: URL,
|}>;

const componentStyles = createStyleSheet({
  link: {
    color: BRAND_COLOR,
  },
});

/**
 * A button styled like a web link.
 */
export default function WebLink(props: Props): Node {
  return (
    <ZulipTextIntl
      style={componentStyles.link}
      text={props.label}
      onPress={() => {
        openLinkEmbedded(props.url.toString());
      }}
    />
  );
}
