import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import HtmlNodeText from '../HtmlNodeText';

describe('HtmlNodeText', () => {
  test('renders plain text', () => {
    const rendered = ReactTestRenderer.create(
      <HtmlNodeText data="hello" />
    ).toJSON();
    expect(rendered.children).toEqual(['hello']);
  });
});
