/* @flow */
import React from 'react';

import { Auth } from '../types';
import HtmlNode from './HtmlNode';

type FuncArguments = {
  auth: Auth,
  childrenNodes: Object[],
  cascadingStyle: Object,
  onPress: () => void,
}

export default ({ auth, cascadingStyle, childrenNodes, onPress }: FuncArguments) =>
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
