import React from 'react';

import HtmlNodeText from './HtmlNodeText';
import HtmlNodeTag from './HtmlNodeTag';

export default props =>
  props.type === 'text'
    ? <HtmlNodeText {...props} />
    : <HtmlNodeTag {...props} />;
