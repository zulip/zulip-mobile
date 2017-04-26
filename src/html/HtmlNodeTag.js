import React from 'react';

import styles from './HtmlStyles';
import cascadingStyles from './cascadingStylesView';
import HtmlTagSpan from './tags/HtmlTagSpan';
import HtmlTagA from './tags/HtmlTagA';
import HtmlTagLi from './tags/HtmlTagLi';
import HtmlTagImg from './tags/HtmlTagImg';
import HtmlTagPre from './tags/HtmlTagPre';
import HtmlTagStrong from './tags/HtmlTagStrong';
import HtmlTagItalic from './tags/HtmlTagItalic';
import HtmlTagDiv from './tags/HtmlTagDiv';
import HtmlTagBr from './tags/HtmlTagBr';

// br', 'blockquote',

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
  'br': HtmlTagBr,
};

const stylesFromClassNames = (classNames = '', styleObj) =>
  classNames.split(' ').map(className => styleObj[className]);

export default ({ auth, attribs, name, cascadingStyle, childrenNodes, onPress }) => {
  const style = [
    styles[name],
    ...stylesFromClassNames(attribs.class, styles),
  ];
  const newCascadingStyle = [
    cascadingStyle,
    cascadingStyles[name],
    ...stylesFromClassNames(attribs.class, cascadingStyles),
  ];

  const HtmlComponent = specialTags[name] || HtmlTagSpan;

  return (
    <HtmlComponent
      auth={auth}
      name={name}
      target={attribs.target}
      src={attribs.src}
      href={attribs.href}
      style={style}
      cascadingStyle={newCascadingStyle}
      childrenNodes={childrenNodes}
      onPress={onPress}
    />
  );
};
