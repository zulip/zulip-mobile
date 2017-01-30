import React from 'react';
import { View } from 'react-native';

import HtmlChildren from './HtmlChildren';

export default class HtmlBlockTag extends React.PureComponent {

  render() {
    const { auth, style, childrenNodes } = this.props;

    return (
      <View style={style}>
        <HtmlChildren childrenNodes={childrenNodes} auth={auth} />
      </View>
    );
  }
}
