import React from 'react';
import { View } from 'react-native';

import HtmlChildren from './HtmlChildren';
import renderHtmlChildren from './renderHtmlChildren';

export default class HtmlTagGeneric extends React.PureComponent {

  render() {
    const { auth, style, childrenNodes } = this.props;

    return (
      <View style={style}>
        {renderHtmlChildren({ childrenNodes, auth })}
      </View>
    );
  }
}
