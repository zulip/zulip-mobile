/* @flow strict-local */

import * as eg from '../../../__tests__/lib/exampleData';
import header from '../header';
import type { BackgroundData } from '../../MessageList';

const backgroundData: BackgroundData = ({
  ownEmail: eg.selfUser.email,
  subscriptions: [eg.stream],
}: $FlowFixMe);

describe('header', () => {
  test('correctly encodes `<` in topic, in stream narrow', () => {
    const m = eg.streamMessage({ subject: '1 < 2' });
    const h = header(backgroundData, {
      type: 'header',
      key: `header${m.id}`,
      style: 'topic+date',
      subsequentMessage: m,
    });
    expect(h).not.toContain('1 < 2');
    expect(h).toContain('1 &lt; 2');
    expect(h).not.toContain('1 &amp;lt; 2');
  });

  // TODO: test other cases, and other pieces of data (stream name, user names, etc.)
});
