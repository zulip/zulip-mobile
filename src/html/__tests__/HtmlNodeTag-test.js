import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import HtmlNodeTag from '../HtmlNodeTag';

describe('HtmlNodeTag', () => {
  test('renders a View component', () => {
    const rendered = ReactTestRenderer.create(<HtmlNodeTag attribs={{}} actions={{}} />).toJSON();
    expect(rendered.type).toBe('View');
  });
});
