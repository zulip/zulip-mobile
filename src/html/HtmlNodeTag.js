/* @flow */
import React from 'react';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import type { Auth, Message, PushRouteAction } from '../types';
import styles from './HtmlStyles';
import cascadingStyles from './cascadingStylesView';
import cascadingStylesText from './cascadingStylesText';
import HtmlTagSpan from './tags/HtmlTagSpan';
import HtmlTagA from './tags/HtmlTagA';
import HtmlTagLi from './tags/HtmlTagLi';
import HtmlTagImg from './tags/HtmlTagImg';
import HtmlTagPre from './tags/HtmlTagPre';
import HtmlTagStrong from './tags/HtmlTagStrong';
import HtmlTagItalic from './tags/HtmlTagItalic';
import HtmlTagDiv from './tags/HtmlTagDiv';
import { getEmojiUrl } from '../utils/url';

const specialTags = {
  'span': HtmlTagSpan,
  'p': HtmlTagSpan,
  'code': HtmlTagSpan,
  'a': HtmlTagA,
  'li': HtmlTagLi,
  'img': HtmlTagImg,
  'pre': HtmlTagPre,
  'strong': HtmlTagStrong,
  'b': HtmlTagStrong,
  'em': HtmlTagItalic,
  'i': HtmlTagItalic,
  'div': HtmlTagDiv,
  'blockquote': HtmlTagDiv,
  'ul': HtmlTagDiv,
  'ol': HtmlTagDiv,
  'table': HtmlTagDiv,
  'thead': HtmlTagDiv,
  'tbody': HtmlTagDiv,
  'tr': HtmlTagDiv,
  'th': HtmlTagDiv,
  'td': HtmlTagDiv,
};

const stylesFromClassNames = (classNames = '', styleObj) =>
  classNames.split(' ').map(className => styleObj[className]);

type Props = {
  auth: Auth,
  attribs: Object,
  name: string,
  cascadingStyle: StyleObj,
  cascadingTextStyle: StyleObj,
  childrenNodes: Object[],
  onPress: () => void,
  message: Message,
  pushRoute: PushRouteAction,
};

export default ({ auth, attribs, name, cascadingStyle,
  cascadingTextStyle, childrenNodes, onPress, pushRoute, message }: Props) => {
  const style = [
    styles[name],
    ...stylesFromClassNames(attribs.class, styles),
  ];
  const newCascadingStyle = [
    cascadingStyle,
    cascadingStyles[name],
    ...stylesFromClassNames(attribs.class, cascadingStyles),
  ];
  const newCascadingStylesText = [
    cascadingTextStyle,
    cascadingStylesText[name],
    ...stylesFromClassNames(attribs.class, cascadingStylesText),
  ];

  let HtmlComponent = specialTags[name] || HtmlTagSpan;

  if (attribs.class && attribs.class.startsWith('emoji emoji-')) {
    HtmlComponent = HtmlTagImg;
    attribs.src = getEmojiUrl(attribs.class.split('-').pop());
  }

  return (
    <HtmlComponent
      auth={auth}
      name={name}
      target={attribs.target}
      src={attribs.src}
      href={attribs.href}
      style={style}
      cascadingStyle={newCascadingStyle}
      cascadingTextStyle={newCascadingStylesText}
      childrenNodes={childrenNodes}
      onPress={onPress}
      pushRoute={pushRoute}
      message={message}
    />
  );
};
