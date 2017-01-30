import React from 'react';

import HtmlText from './HtmlText';
import HtmlTag from './HtmlTag';

export default class HtmlNode extends React.PureComponent {

  render() {
    const { type, data } = this.props;

    if (type === 'text') {
      return <HtmlText data={data} />;
    }

    return <HtmlTag {...this.props} />;
  }
}
