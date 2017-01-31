import React from 'react';

import styles from './HtmlStyles';
import cascadingStyles from './HtmlCascadingStyles';
import HtmlTagSpan from './HtmlTagSpan';
import HtmlTagA from './HtmlTagA';
import HtmlTagLi from './HtmlTagLi';
import HtmlTagImg from './HtmlTagImg';
import HtmlTagPre from './HtmlTagPre';
import HtmlTagStrong from './HtmlTagStrong';
import HtmlTagItalic from './HtmlTagItalic';
import HtmlTagDiv from './HtmlTagDiv';

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
};

export default ({ auth, attribs, name, cascadingStyle, childrenNodes }) => {
  const style = [
    styles[name],
    styles[attribs.class]
  ];
  const newCascadingStyle = [
    cascadingStyle,
    cascadingStyles[name],
    cascadingStyles[attribs.class]
  ];

  const HtmlComponent = specialTags[name] || HtmlTagSpan;

  return (
    <HtmlComponent
      auth={auth}
      name={name}
      className={attribs.class}
      target={attribs.target}
      src={attribs.src}
      href={attribs.href}
      style={style}
      cascadingStyle={newCascadingStyle}
      childrenNodes={childrenNodes}
    />
  );
};
