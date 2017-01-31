import React from 'react';

import HtmlNode from './HtmlNode';

export default ({ auth, cascadingStyle, childrenNodes }) => {
  if (!childrenNodes) {
    return null;
  }

  return childrenNodes.map((node, index) =>
    <HtmlNode
      key={index}
      auth={auth}
      cascadingStyle={cascadingStyle}
      data={node.data}
      name={node.name}
      type={node.type}
      attribs={node.attribs}
      childrenNodes={node.children}
    />
  );
};
