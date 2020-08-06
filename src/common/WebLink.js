/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import Label from './Label';
import { getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { getCurrentRealm } from '../selectors';
import { BRAND_COLOR, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  label: string,
  href: string,
  realm: string,
|}>;

/**
 * A button styled like a web link.
 *
 * @prop label - Text of the button.
 * @prop href - URL address to open on press.
 * @prop realm - Current realm. Used if the `href` property is relative.
 */
class WebLink extends PureComponent<Props> {
  handlePress = () => {
    const { realm, href } = this.props;
    openLink(getFullUrl(href, realm));
  };

  styles = createStyleSheet({
    link: {
      marginTop: 10,
      fontSize: 15,
      color: BRAND_COLOR,
      textAlign: 'right',
    },
  });

  render() {
    return <Label style={this.styles.link} text={this.props.label} onPress={this.handlePress} />;
  }
}

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(WebLink);
