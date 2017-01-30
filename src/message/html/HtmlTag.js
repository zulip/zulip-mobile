import React from 'react';

import styles from './HtmlStyles';
import cascadingStyles from './HtmlCascadingStyles';
import HtmlTagGeneric from './HtmlTagGeneric';
import HtmlTagImg from './HtmlTagImg';
import HtmlTagA from './HtmlTagA';
import HtmlTagTable from './HtmlTagTable';

const inlineTags = new Set([
  'img', 'span', 'a', 'strong', 'em', 'b', 'i'
]);

const blockTags = new Set([
  'p', 'code', 'pre', 'ul', 'ol', 'li', 'br', 'blockquote'
]);

const specialTags = {
  'a': HtmlTagA,
  'img': HtmlTagImg,
  // 'table': HtmlTagTable,
};

export default class HtmlNode extends React.PureComponent {

  render() {
    const { auth, attribs, name, childrenNodes } = this.props;
    const isInline = inlineTags.has(name);
    const isBlock = blockTags.has(name);
    const style = [
      isInline && styles.inline,
      isBlock && styles.block,
      styles[name],
      styles[attribs.class]
    ];
    const cascadingStyle = [
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
        cascadingStyle={cascadingStyle}
        childrenNodes={childrenNodes}
      />
    );
  }
}
