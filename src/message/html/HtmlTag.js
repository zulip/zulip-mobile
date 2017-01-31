import React from 'react';

import styles from './HtmlStyles';
import cascadingStyles from './HtmlCascadingStyles';
import HtmlTagGeneric from './HtmlTagGeneric';
import HtmlTagImg from './HtmlTagImg';
import HtmlTagA from './HtmlTagA';
import HtmlTagPre from './HtmlTagPre';

const inlineTags = new Set([
  'img', 'span', 'a', 'strong', 'em', 'b', 'i'
]);

const blockTags = new Set([
  'p', 'code', 'pre', 'ul', 'ol', 'li', 'br', 'blockquote', 'table',
]);

const specialTags = {
  'a': HtmlTagA,
  'img': HtmlTagImg,
  'pre': HtmlTagPre,
};

export default class HtmlNode extends React.PureComponent {

  render() {
    const { auth, attribs, name, cascadingStyle, childrenNodes } = this.props;
    const isInline = inlineTags.has(name);
    const isBlock = blockTags.has(name);
    const style = [
      isInline && styles.inline,
      isBlock && styles.block,
      styles[name],
      styles[attribs.class]
    ];
    const newCascadingStyle = [
      cascadingStyle,
      cascadingStyles[name],
      cascadingStyles[attribs.class]
    ];

    const HtmlComponent = specialTags[name] || HtmlTagGeneric;

    return (
      <HtmlComponent
        auth={auth}
        name={name}
        className={attribs.class}
        target={attribs.target}
        src={attribs.src}
        style={style}
        cascadingStyle={newCascadingStyle}
        childrenNodes={childrenNodes}
      />
    );
  }
}
