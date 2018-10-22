/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Context, GlobalState } from '../types';
import Touchable from './Touchable';
import Label from './Label';
import { getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { getCurrentRealm } from '../selectors';

type Props = {
  label: string,
  href: string,
  realm: string,
};

/**
 * A button styled like a web link.
 *
 * @prop label - Text of the button.
 * @prop href - URL address to open on press.
 * @prop realm - Current realm. Used if the `href` property is relative.
 */
class WebLink extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handlePress = () => {
    const { realm, href } = this.props;
    openLink(getFullUrl(href, realm));
  };

  render() {
    const { styles } = this.context;
    const { label } = this.props;

    return (
      <Touchable>
        <Label style={styles.link} text={label} onPress={this.handlePress} />
      </Touchable>
    );
  }
}

export default connect((state: GlobalState) => ({
  realm: getCurrentRealm(state),
}))(WebLink);
