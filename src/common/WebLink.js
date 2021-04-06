/* @flow strict-local */

import React from 'react';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import Label from './Label';
import openLink from '../utils/openLink';
import { getCurrentRealm } from '../selectors';
import { BRAND_COLOR, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  label: string,
  href: string,
  realm: URL,
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
function WebLink(props: Props) {
  return (
    <Label
      style={componentStyles.link}
      text={props.label}
      onPress={() => {
        const { realm, href } = props;
        openLink(new URL(href, realm).toString());
      }}
    />
  );
}

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(WebLink);
