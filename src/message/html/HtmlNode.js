import React from 'react';

import HtmlText from './HtmlText';
import HtmlTag from './HtmlTag';

export default class HtmlNode extends React.PureComponent {

  render() {
    const { type, data, cascadingStyle } = this.props;

    if (type === 'text') {
      return <HtmlText data={data} style={cascadingStyle} />;
    }

    return <HtmlTag {...this.props} />;
  }
}
