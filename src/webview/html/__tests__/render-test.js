/* @flow strict-local */
import messageTypingAsHtml from '../messageTypingAsHtml';
import * as eg from '../../../__tests__/lib/exampleData';

describe('typing', () => {
  it('escapes &< (e.g., in `avatar_url` and `email`', () => {
    const name = '&<name';
    const user = {
      ...eg.makeUser({ name }),
      avatar_url: `https://zulip.example.org/yo/avatar-${name}.png`,
      email: `${name}@example.com`,
    };

    expect(messageTypingAsHtml(eg.realm.toString(), [user])).not.toContain('&<');
  });
});
