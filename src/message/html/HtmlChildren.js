import React from 'react';
import { View } from 'react-native';

import HtmlNode from './HtmlNode';

export default class HtmlChildren extends React.PureComponent {

  render() {
    const { auth, childrenNodes } = this.props;

    if (!childrenNodes) {
      return null;
    }

    return (
      <View>
        {childrenNodes.map((node, index) =>
          <HtmlNode
            key={index}
            auth={auth}
            data={node.data}
            name={node.name}
            type={node.type}
            attribs={node.attribs}
            childrenNodes={node.children}
          />
        )}
      </View>
    );
  }
}
