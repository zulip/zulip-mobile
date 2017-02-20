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
import HtmlTagBr from './HtmlTagBr';

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

export default ({ auth, attribs, name, cascadingStyle, childrenNodes }) => {
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

  // User mentions should not have any breaking spaces
  if (attribs.class && attribs.class === 'user-mention') {
    for (const node of childrenNodes) {
      // Replace every breaking space with a Unicode non-breaking space (\u00a0)
      node.data = node.data.replace(/ /g, '\u00a0');
    }
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
      childrenNodes={childrenNodes}
    />
  );
};
