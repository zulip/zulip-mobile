import React from 'react';
import renderer from 'react-test-renderer';

import { Footer } from '../LightboxFooter';

describe('LightboxFooter', () => {
  test('all required props are passed correctly', () => {
    const displayMessage = 'Shared in #mobile';
    const onOptionsPress = jest.fn();

    const footer = renderer.create(
      <Footer displayMessage={displayMessage} onOptionsPress={onOptionsPress} style={{}} />,
    );

    expect(footer).toMatchSnapshot();
  });
});
