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
  indexedStyles?: any[],
};

export default ({
  auth,
  cascadingStyle,
  childrenNodes,
  cascadingTextStyle,
  onPress,
  pushRoute,
  message,
  indexedStyles
}: Props) =>
  childrenNodes &&
  childrenNodes
    .filter(
      x =>
        x.data !== '\n' &&
        !(x.attribs && x.attribs['aria-hidden'] === 'true') &&
        x.name !== 'annotation'
    )
    .map((node, index) =>
      (<HtmlNode
        key={index}
        auth={auth}
        cascadingStyle={cascadingStyle}
        cascadingTextStyle={[cascadingTextStyle, indexedStyles && indexedStyles[index]]}
        data={node.data}
        name={node.name}
        type={node.type}
        attribs={node.attribs}
        childrenNodes={node.children}
        onPress={onPress}
        pushRoute={pushRoute}
        message={message}
      />)
    );
