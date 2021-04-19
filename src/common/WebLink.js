/* @flow strict-local */

import React from 'react';

import Label from './Label';
import { openLinkEmbedded } from '../utils/openLink';
import { BRAND_COLOR, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  label: string,
  url: URL,
|}>;

const componentStyles = createStyleSheet({
  link: {
    marginTop: 10,
    fontSize: 15,
    color: BRAND_COLOR,
    textAlign: 'right',
  },
});

/**
 * A button styled like a web link.
 */
export default function WebLink(props: Props) {
  return (
    <Label
      style={componentStyles.link}
      text={props.label}
      onPress={() => {
        openLinkEmbedded(props.url.toString());
      }}
    />
  );
}
