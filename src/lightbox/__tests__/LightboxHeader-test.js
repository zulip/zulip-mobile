import React from 'react';

import { Header } from '../LightboxHeader';
import { rendererWithStoreAndStyle } from '../../utils/tests';

describe('LightboxHeader', () => {
  test('all required props are passed correctly', () => {
    const message = {
      type: 'stream',
      avatar_url: 'https://example/tester.png',
      display_recipient: 'stream',
      timestamp: 1501218744,
      sender_full_name: 'tester',
    };
    const actions = {
      navigateBack: jest.fn(),
    };
    const auth = {
      realm: 'https://example.com',
    };
    const subheader = 'Today at 5:00 PM';

    const header = rendererWithStoreAndStyle(
      <Header
        onPressBack={actions.navigateBack}
        timestamp={message.timestamp}
        avatarUrl={message.avatar_url}
        senderName={message.sender_full_name}
        realm={auth.realm}
        subheader={subheader}
      />,
    );

    expect(header).toMatchSnapshot();
  });
});
