/* @flow */
import React from 'react';

import HtmlNodeText from './HtmlNodeText';
import HtmlNodeTag from './HtmlNodeTag';

export default (props: Object) =>
  props.type === 'text' ? <HtmlNodeText {...props} /> : <HtmlNodeTag {...props} />;
