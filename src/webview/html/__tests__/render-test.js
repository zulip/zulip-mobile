/* @flow strict-local */
import messageTypingAsHtml from '../messageTypingAsHtml';
import * as eg from '../../../__tests__/lib/exampleData';

describe('typing', () => {
  it('escapes &< (e.g., in `avatar_url` and `email`', () => {
    const name = '&<name';
    const user = eg.makeUser({ full_name: name, email: `${name}@example.com` });
    expect(messageTypingAsHtml(eg.realm, [user])).not.toContain('&<');
  });
});
