import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import StylesProvider from '../../StylesProvider';
import HtmlNodeText from '../HtmlNodeText';

describe('HtmlNodeText', () => {
  test('renders plain text', () => {
    const rendered = ReactTestRenderer.create(
      <StylesProvider>
        <HtmlNodeText data="hello" />
      </StylesProvider>,
    ).toJSON();
    expect(rendered.children).toEqual(['hello']);
  });
});
