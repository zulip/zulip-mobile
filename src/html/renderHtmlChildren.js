/* @flow */
import React from 'react';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import { Auth } from '../types';
import HtmlNode from './HtmlNode';

type Props = {
  auth: Auth,
  childrenNodes: Object[],
  cascadingStyle: StyleObj,
  onPress: () => void,
}

export default ({ auth, cascadingStyle, childrenNodes, onPress }: Props) =>
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
