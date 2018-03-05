/* @flow */
import React, { PureComponent } from 'react';

import connectWithActions from '../connectWithActions';
import { Touchable, Label } from '../common';
import { StyleObj } from '../types';
import { getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { getCurrentRealm } from '../selectors';

type Props = {
  label: string,
  href: string,
  realm: string,
  style?: StyleObj,
  labelStyle?: StyleObj,
};

class WebLink extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  handlePress = () => {
    const { realm, href } = this.props;
    openLink(getFullUrl(href, realm));
  };

  render() {
    const { styles } = this.context;
    const { label, style, labelStyle } = this.props;

    return (
      <Touchable style={style}>
        <Label style={[styles.link, labelStyle]} text={label} onPress={this.handlePress} />
      </Touchable>
    );
  }
}

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
}))(WebLink);
