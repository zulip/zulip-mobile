/* @flow strict-local */

import React, { PureComponent } from 'react';

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

/**
 * A button styled like a web link.
 *
 * @prop label - Text of the button.
 * @prop href - URL address to open on press.
 * @prop realm - Current realm. Used if the `href` property is relative.
 */
class WebLink extends PureComponent<Props> {
  styles = createStyleSheet({
    link: {
      marginTop: 10,
      fontSize: 15,
      color: BRAND_COLOR,
      textAlign: 'right',
    },
  });

  render() {
    return (
      <Label
        style={this.styles.link}
        text={this.props.label}
        onPress={() => {
          const { realm, href } = this.props;
          openLink(new URL(href, realm).toString());
        }}
      />
    );
  }
}

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(WebLink);
