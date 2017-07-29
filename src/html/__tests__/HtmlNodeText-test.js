import React from 'react';

import { rendererWithStyle } from '../../utils/tests';
import HtmlNodeText from '../HtmlNodeText';

describe('HtmlNodeText', () => {
  test('renders plain text', () => {
    const rendered = rendererWithStyle(<HtmlNodeText data="hello" />).toJSON();
    expect(rendered.children).toEqual(['hello']);
  });
});
