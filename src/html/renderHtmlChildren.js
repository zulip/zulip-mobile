/* @flow */
import React from 'react';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import { Auth } from '../types';
import HtmlNode from './HtmlNode';

type Props = {
  auth: Auth,
  childrenNodes: ?any[],
  cascadingStyle?: StyleObj,
  cascadingTextStyle?: StyleObj,
  onPress: (html: string) => void,
};

export default ({ auth, cascadingStyle, childrenNodes,
  cascadingTextStyle, onPress }: Props) =>
  childrenNodes &&
  childrenNodes
    .filter(x => x.data !== '\n')
    .map((node, index) => (
      <HtmlNode
        key={index}
        auth={auth}
        cascadingStyle={cascadingStyle}
        cascadingTextStyle={cascadingTextStyle}
        data={node.data}
        name={node.name}
        type={node.type}
        attribs={node.attribs}
        childrenNodes={node.children}
        onPress={onPress}
      />
    ));
