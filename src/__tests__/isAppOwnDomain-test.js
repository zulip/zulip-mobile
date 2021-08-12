/* @flow strict-local */

import isAppOwnDomain from '../isAppOwnDomain';

describe('isAppOwnDomain', () => {
  test.each([
    ['https://chat.zulip.org', true],
    ['https://zulipchat.com', true],
    ['https://zulip.com', true],
    ['https://example.zulipchat.com', true],
    ['https://example.zulip.com', true],
    ['https://example.zulip.com/api/v1/server_settings', true],
    ['https://example.zulip.com/avatar/1234', true],

    ['https://zulipchat.org', false],
    ['https://www.google.com', false],
    ['https://zulipchat.co.uk', false],
    ['https://chat.zulip.io', false],
  ])('%s should be %p', (urlStr: string, expected: boolean) => {
    expect(isAppOwnDomain(new URL(urlStr))).toBe(expected);
  });
});
