/* @flow strict-local */

import React from 'react';

import { useSelector } from '../react-redux';
import Label from './Label';
import openLink from '../utils/openLink';
import { getCurrentRealm } from '../selectors';
import { BRAND_COLOR, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  label: string,
  href: string,
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
  const realm = useSelector(getCurrentRealm);
  return (
    <Label
      style={componentStyles.link}
      text={props.label}
      onPress={() => {
        const { href } = props;
        openLink(new URL(href, realm).toString());
      }}
    />
  );
}
