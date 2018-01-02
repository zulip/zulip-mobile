/* @flow */
import React from 'react';

import type { Auth, Actions, Message, DomElement, StyleObj } from '../../types';
import HtmlNode from './HtmlNode';

type Props = {
  auth?: Auth,
  actions: Actions,
  message?: Message,
  childrenNodes?: DomElement[],
  cascadingStyle?: StyleObj,
  cascadingTextStyle?: StyleObj,
  onPress?: (html: string) => void,
  indexedStyles?: any[],
  indexedViewsStyles?: any[],
  splitMessageText?: boolean,
};

export default ({
  auth,
  actions,
  cascadingStyle,
  childrenNodes,
  cascadingTextStyle,
  onPress,
  message,
  indexedStyles,
  indexedViewsStyles,
  splitMessageText,
}: Props) =>
  childrenNodes &&
  childrenNodes
    .filter(
      x =>
        x.data !== '\n' &&
        !(x.attribs && x.attribs['aria-hidden'] === 'true') &&
        x.name !== 'annotation',
    )
    .map((node, index) => (
      <HtmlNode
        key={index} // eslint-disable-line react/no-array-index-key
        auth={auth}
        actions={actions}
        cascadingStyle={[cascadingStyle, indexedViewsStyles && indexedViewsStyles[index]]}
        cascadingTextStyle={[cascadingTextStyle, indexedStyles && indexedStyles[index]]}
        data={node.data}
        name={node.name}
        type={node.type}
        attribs={node.attribs}
        childrenNodes={node.children}
        onPress={onPress}
        message={message}
        splitMessageText={splitMessageText}
      />
    ));
