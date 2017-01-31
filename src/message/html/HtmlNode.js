import React from 'react';

import HtmlNodeText from './HtmlNodeText';
import HtmlNodeTag from './HtmlNodeTag';

export default class HtmlNode extends React.PureComponent {

  render() {
    const { type, data, cascadingStyle } = this.props;

    if (type === 'text') {
      return <HtmlNodeText data={data} style={cascadingStyle} />;
    }

    return <HtmlNodeTag {...this.props} />;
  }
}
