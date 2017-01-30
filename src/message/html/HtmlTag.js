import React from 'react';

import HtmlImg from './HtmlImg';
import HtmlDiv from './HtmlDiv';

const tagToComponent = {
  'img': HtmlImg,
  'p': HtmlDiv,
  'div': HtmlDiv,
  'span': HtmlDiv,
  'code': HtmlDiv,
  'a': HtmlDiv,
  'ul': HtmlDiv,
  'li': HtmlDiv,
};

export default class HtmlNode extends React.PureComponent {

  render() {
    const { auth, attribs, name, childrenNodes } = this.props;

    const HtmlComponent = tagToComponent[name];
    if (!HtmlComponent) console.log('ALERT', name);
    return (
      <HtmlComponent
        auth={auth}
        name={name}
        src={attribs.src}
        className={attribs.class}
        childrenNodes={childrenNodes}
      />
    );
  }
}
