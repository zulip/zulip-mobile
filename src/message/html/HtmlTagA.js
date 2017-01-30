import React from 'react';

import HtmlChildren from './HtmlChildren';
import { Touchable } from '../../common';
import { getResource } from '../../utils/url';

export default class HtmlTagA extends React.PureComponent {
  render() {
    const { auth, target, childrenNodes, cascadingStyle, onPress } = this.props;
    const source = target && getResource(target, auth);

    return (
      <HtmlChildren
        childrenNodes={childrenNodes}
        auth={auth}
        cascadingStyle={cascadingStyle}
      />
    );
  }
}
