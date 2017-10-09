/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Touchable, Label } from '../common';
import { getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { getCurrentRealm } from '../selectors';

type Props = {
  label: string,
  href: string,
  realm: string,
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
    const { label } = this.props;

    return (
      <Touchable>
        <Label style={[styles.link]} text={label} onPress={this.handlePress} />
      </Touchable>
    );
  }
}

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(WebLink);
