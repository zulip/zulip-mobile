import React from 'react';
import { View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import StylesProvider from '../StylesProvider';

describe('StylesProvider', () => {
  test('renders', () => {
    const rendered = ReactTestRenderer.create(
      <StylesProvider>
        <View />
      </StylesProvider>
    ).toJSON();
    expect(rendered.type).toEqual('View');
  });
});
