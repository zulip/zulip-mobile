/* @flow */
import React from 'react';

import type { Auth, Message, PushRouteAction, DomElement, StyleObj } from '../types';
import HtmlNode from './HtmlNode';

type Props = {
  auth?: Auth,
  message?: Message,
  childrenNodes?: DomElement[],
  cascadingStyle?: StyleObj,
  cascadingTextStyle?: StyleObj,
  onPress?: (html: string) => void,
  pushRoute?: PushRouteAction,
};

export default ({
  auth,
  cascadingStyle,
  childrenNodes,
  cascadingTextStyle,
  onPress,
  pushRoute,
  message,
}: Props) =>
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
        pushRoute={pushRoute}
        message={message}
      />
    ));
