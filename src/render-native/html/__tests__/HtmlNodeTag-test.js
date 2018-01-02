import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';

import store from '../../../boot/store';
import HtmlNodeTag from '../HtmlNodeTag';

describe('HtmlNodeTag', () => {
  test('renders a View component', () => {
    const rendered = ReactTestRenderer.create(
      <Provider store={store}>
        <HtmlNodeTag attribs={{}} actions={{}} />
      </Provider>,
    ).toJSON();
    expect(rendered.type).toBe('View');
  });
});
