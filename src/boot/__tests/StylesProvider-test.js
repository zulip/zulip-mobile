import React from 'react';
import { View } from 'react-native';

import { rendererWithStyle } from '../../utils/tests';

describe('StylesProvider', () => {
  test('renders', () => {
    const rendered = rendererWithStyle(<View />).toJSON();
    expect(rendered.type).toEqual('View');
  });
});
