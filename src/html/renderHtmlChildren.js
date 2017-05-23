import React from 'react';

import HtmlNode from './HtmlNode';

export default ({ auth, cascadingStyle, childrenNodes, onPress }) =>
  childrenNodes &&
  childrenNodes
    .filter(x => x.data !== '\n')
    .map((node, index) => (
      <HtmlNode
        key={index}
        auth={auth}
        cascadingStyle={cascadingStyle}
        data={node.data}
        name={node.name}
        type={node.type}
        attribs={node.attribs}
        childrenNodes={node.children}
        onPress={onPress}
      />
    ));
