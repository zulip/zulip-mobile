/* @flow strict-local */

import type { UserId, UserOrBot } from '../../types';
import { streamNarrow, topicNarrow, pmNarrowFromUsersUnsafe, STARRED_NARROW } from '../narrow';
import {
  isInternalLink,
  isMessageLink,
  getLinkType,
  getNarrowFromLink,
  getMessageIdFromLink,
  decodeHashComponent,
} from '../internalLinks';
import * as eg from '../../__tests__/lib/exampleData';

const realm = new URL('https://example.com');

describe('isInternalLink', () => {
  const cases: $ReadOnlyArray<[boolean, string, string] | [boolean, string, string, URL]> = [
    [true, 'fragment-only, to a narrow', '#narrow/stream/jest/topic/topic1'],
    [false, 'fragment-only, wrong fragment', '#nope'],
    [true, 'path-absolute, to a narrow', '/#narrow/stream/jest'],
    [false, 'path-absolute, wrong fragment', '/#nope'],
    [false, 'path-absolute, wrong path', '/user_uploads/#narrow/stream/jest'],
    [true, 'same domain, to a narrow', 'https://example.com/#narrow/stream/jest'],
    [false, 'same domain, wrong fragment', 'https://example.com/#nope'],
    [false, 'same domain, wrong path', 'https://example.com/user_uploads/#narrow/stream/jest'],
    [false, 'wrong domain', 'https://another.com/#narrow/stream/jest'],

    [true, 'fragment-only, with numeric IDs', '#narrow/stream/123-jest/topic/topic1'],
    [true, 'path-absolute, with numeric IDs', '/#narrow/stream/123-jest'],
    [true, 'path-absolute, with numeric IDs', '/#narrow/pm-with/123-mark'],

    [false, 'fragment-only, #narrowly', '#narrowly/stream/jest'],
    [false, 'path-absolute, #narrowly', '/#narrowly/stream/jest'],
    [false, 'same domain, #narrowly', 'https://example.com/#narrowly/stream/jest'],

    [false, 'same domain, double slash', 'https://example.com//#narrow/stream/jest'],
    [false, 'same domain, triple slash', 'https://example.com///#narrow/stream/jest'],

    // These examples may be odd-looking URLs, but are nevertheless valid.
    [true, 'scheme-relative', '//example.com/#narrow/stream/jest'],
    [true, 'path-relative, nop path', '.#narrow/stream/jest'],
    [true, 'path-relative, nop path', './#narrow/stream/jest'],
    [true, 'path-relative, nop path', '..#narrow/stream/jest'],
    [true, 'path-relative, nop path', '../#narrow/stream/jest'],
    [true, 'path-relative, nop path', 'foo/..#narrow/stream/jest'],
    [true, 'path-relative, nop path', 'foo/../#narrow/stream/jest'],
    [true, 'path-relative, nop path', 'foo/bar/../../../baz/.././#narrow/stream/jest'],
    [true, 'path-absolute, nop path', '/.#narrow/stream/jest'],
    [true, 'path-absolute, nop path', '/./#narrow/stream/jest'],
    [true, 'path-absolute, nop path', '/..#narrow/stream/jest'],
    [true, 'path-absolute, nop path', '/../#narrow/stream/jest'],
    [true, 'path-absolute, nop path', '/foo/..#narrow/stream/jest'],
    [true, 'path-absolute, nop path', '/foo/../#narrow/stream/jest'],
    [true, 'path-absolute, nop path', '/foo/bar/../../../baz/.././#narrow/stream/jest'],
    [true, 'same domain, nop path', 'https://example.com/.#narrow/stream/jest'],
    [true, 'same domain, nop path', 'https://example.com/./#narrow/stream/jest'],
    [true, 'same domain, nop path', 'https://example.com/..#narrow/stream/jest'],
    [true, 'same domain, nop path', 'https://example.com/../#narrow/stream/jest'],
    [true, 'same domain, nop path', 'https://example.com/foo/..#narrow/stream/jest'],
    [true, 'same domain, nop path', 'https://example.com/foo/../#narrow/stream/jest'],
    [
      true,
      'same domain, nop path',
      'https://example.com/foo/bar/../../../baz/.././#narrow/stream/jest',
    ],
    [true, 'same domain, %-encoded host', 'https://%65xample%2ecom/#narrow/stream/jest'],
    // This one fails because our polyfilled URL implementation has IDNA stripped out.
    // [true, 'same domain, punycoded host', 'https://example.xn--h2brj9c/#narrow/stream/jest', new URL('https://example.भारत/'),], // FAILS
    [
      true,
      'same domain, punycodable host',
      'https://example.भारत/#narrow/stream/jest',
      new URL('https://example.भारत/'),
    ],
    // This one fails because our polyfilled URL implementation has IDNA stripped out.
    // [true, 'same domain, IDNA-mappable', 'https://ℯⅩªm🄿ₗℰ.ℭᴼⓂ/#narrow/stream/jest'], // FAILS
    [
      true,
      'same IPv4 address, %-encoded',
      'http://%31%39%32%2e168%2e0%2e1/#narrow/stream/jest',
      new URL('http://192.168.0.1/'),
    ],
    // This one fails because our polyfilled URL implementation has IDNA stripped out.
    // [true, 'same IPv4 address, IDNA-mappable', 'http://１𝟗𝟚。①⁶🯸．₀｡𝟭/#narrow/stream/jest', new URL('http://192.168.0.1/'),], // FAILS
    [
      true,
      'same IPv4 address, suppressed zero octet',
      'http://192.168.1/#narrow/stream/jest',
      new URL('http://192.168.0.1/'),
    ],
    // TODO: Add tests for IPv6.
    [true, 'same domain, empty port', 'https://example.com:/#narrow/stream/jest'],
    [true, 'same domain, redundant port', 'https://example.com:443/#narrow/stream/jest'],
    [
      true,
      'same domain, padded port',
      'https://example.com:00000000444/#narrow/stream/jest',
      new URL('https://example.com:444/'),
    ],

    // These examples are not "valid URL strings", but are nevertheless
    // accepted by the URL parser.
    [true, 'fragment-only, with whitespace', '    #\tnar\rr\now/stream/jest  '],
    [true, 'path-absolute, with whitespace', '    /\t#\nnar\rrow/stream/jest   '],
    [true, 'same domain, with whitespace', '  ht\ttp\ns\r://ex\nample.com/#\nnarrow/stream/jest'],
    [true, 'scheme but path-relative', 'https:#narrow/stream/jest'],
    [true, 'scheme but path-relative, nop path', 'https:./foo/../#narrow/stream/jest'],
    [true, 'scheme but path-absolute', 'https:/#narrow/stream/jest'],
    [true, 'scheme but path-absolute, nop path', 'https:/./foo/../#narrow/stream/jest'],
    [
      true,
      'same IPv4 address, in hex and octal',
      'http://0xc0.0250.0.1/#narrow/stream/jest',
      new URL('http://192.168.0.1/'),
    ],
    [
      true,
      'same IPv4 address, with joined octets',
      'http://192.11010049/#narrow/stream/jest',
      new URL('http://192.168.0.1/'),
    ],
    [
      true,
      'same IPv4 address, with trailing dot',
      'http://192.168.0.1./#narrow/stream/jest',
      new URL('http://192.168.0.1/'),
    ],

    // These examples may seem weird, but a previous version accepted most of them.
    [
      false,
      'wrong domain, realm-like path, narrow-like fragment',
      // This one, except possibly the fragment, is a 100% realistic link
      // for innocent normal use.  The buggy old version narrowly avoided
      // accepting it... but would accept all the variations below.
      'https://web.archive.org/web/*/https://example.com/#narrow/stream/jest',
    ],
    [
      false,
      'odd scheme, wrong domain, realm-like path, narrow-like fragment',
      'ftp://web.archive.org/web/*/https://example.com/#narrow/stream/jest',
    ],
    [
      false,
      'same domain, realm-like path, narrow-like fragment',
      'https://example.com/web/*/https://example.com/#narrow/stream/jest',
    ],
    [
      false,
      'path-absolute, realm-like path, narrow-like fragment',
      '/web/*/https://example.com/#narrow/stream/jest',
    ],
    [
      false,
      'path-relative, realm-like path, narrow-like fragment',
      'web/*/https://example.com/#narrow/stream/jest',
    ],
  ];

  // $FlowFixMe realm_ is URL | void, but complains of out-of-bounds access
  for (const [expected, description, url, realm_] of cases) {
    test(`${expected ? 'accept' : 'reject'} ${description}: ${url}`, () => {
      expect(isInternalLink(url, realm_ ?? realm)).toBe(expected);
    });
  }
});

describe('isMessageLink', () => {
  test('only in-app link containing "near/<message-id>" is a message link', () => {
    expect(isMessageLink('https://example.com/#narrow/stream/jest', realm)).toBe(false);
    expect(isMessageLink('https://example.com/#narrow/#near/1', realm)).toBe(true);
  });
});

describe('getLinkType', () => {
  test('links to a different domain are of "external" type', () => {
    expect(getLinkType('https://google.com/some-path', realm)).toBe('external');
  });

  test('only in-app link containing "stream" is a stream link', () => {
    expect(getLinkType('https://example.com/#narrow/pm-with/1,2-group', realm)).toBe('pm');
    expect(getLinkType('https://example.com/#narrow/stream/jest', realm)).toBe('stream');
    expect(getLinkType('https://example.com/#narrow/stream/stream/', realm)).toBe('stream');
  });

  test('when a url is not a topic narrow return false', () => {
    expect(getLinkType('https://example.com/#narrow/pm-with/1,2-group', realm)).toBe('pm');
    expect(getLinkType('https://example.com/#narrow/stream/jest', realm)).toBe('stream');
    expect(getLinkType('https://example.com/#narrow/stream/stream/topic/topic/near/', realm)).toBe(
      'home',
    );
    expect(getLinkType('https://example.com/#narrow/stream/topic/', realm)).toBe('stream');
  });

  test('when a url is a topic narrow return true', () => {
    expect(getLinkType('https://example.com/#narrow/stream/jest/topic/test', realm)).toBe('topic');
    expect(
      getLinkType('https://example.com/#narrow/stream/mobile/subject/topic/near/378333', realm),
    ).toBe('topic');
    expect(getLinkType('https://example.com/#narrow/stream/mobile/topic/topic/', realm)).toBe(
      'topic',
    );
    expect(getLinkType('https://example.com/#narrow/stream/stream/topic/topic/near/1', realm)).toBe(
      'topic',
    );
    expect(
      getLinkType('https://example.com/#narrow/stream/stream/subject/topic/near/1', realm),
    ).toBe('topic');

    expect(getLinkType('/#narrow/stream/stream/subject/topic', realm)).toBe('topic');
  });

  test('only in-app link containing "pm-with" is a group link', () => {
    expect(getLinkType('https://example.com/#narrow/stream/jest/topic/test', realm)).toBe('topic');
    expect(getLinkType('https://example.com/#narrow/pm-with/1,2-group', realm)).toBe('pm');
    expect(getLinkType('https://example.com/#narrow/pm-with/1,2-group/near/1', realm)).toBe('pm');
    expect(
      getLinkType('https://example.com/#narrow/pm-with/a.40b.2Ecom.2Ec.2Ed.2Ecom/near/3', realm),
    ).toBe('pm');
  });

  test('only in-app link containing "is" is a special link', () => {
    expect(getLinkType('https://example.com/#narrow/stream/jest/topic/test', realm)).toBe('topic');
    expect(getLinkType('https://example.com/#narrow/is/private', realm)).toBe('special');
    expect(getLinkType('https://example.com/#narrow/is/starred', realm)).toBe('special');
    expect(getLinkType('https://example.com/#narrow/is/mentioned', realm)).toBe('special');
    expect(getLinkType('https://example.com/#narrow/is/men', realm)).toBe('home');
    expect(getLinkType('https://example.com/#narrow/is/men/stream', realm)).toBe('home');
    expect(getLinkType('https://example.com/#narrow/are/men/stream', realm)).toBe('home');
  });
});

describe('decodeHashComponent', () => {
  test('correctly decode MediaWiki-style dot-encoded strings', () => {
    expect(decodeHashComponent('some_text')).toEqual('some_text');
    expect(decodeHashComponent('some.20text')).toEqual('some text');
    expect(decodeHashComponent('some.2Etext')).toEqual('some.text');

    expect(decodeHashComponent('na.C3.AFvet.C3.A9')).toEqual('naïveté');
    expect(decodeHashComponent('.C2.AF.5C_(.E3.83.84)_.2F.C2.AF')).toEqual('¯\\_(ツ)_/¯');

    // malformed dot-encoding
    expect(() => decodeHashComponent('some.text')).toThrow();
    expect(() => decodeHashComponent('some.2gtext')).toThrow();
    expect(() => decodeHashComponent('some.arbitrary_text')).toThrow();

    // malformed UTF-8
    expect(() => decodeHashComponent('.88.99.AA.BB')).toThrow();
  });
});

describe('getNarrowFromLink', () => {
  const [userB, userC] = [eg.makeUser(), eg.makeUser()];
  const allUsersById: Map<UserId, UserOrBot> = new Map(
    [eg.selfUser, userB, userC].map(u => [u.user_id, u]),
  );

  const streamGeneral = eg.makeStream({ name: 'general' });

  const get = (url, streams = []) =>
    getNarrowFromLink(
      url,
      new URL('https://example.com'),
      allUsersById,
      new Map(streams.map(s => [s.stream_id, s])),
      eg.selfUser.user_id,
    );

  test('on link to realm domain but not narrow: return null', () => {
    expect(get('https://example.com/user_uploads')).toEqual(null);
  });

  describe('on stream links', () => {
    // Tell ESLint to recognize `expectStream` as a helper function that
    // runs assertions.
    /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "expectStream"] }] */
    const expectStream = (operand, streams, expectedName: null | string) => {
      expect(get(`#narrow/stream/${operand}`, streams)).toEqual(
        expectedName === null ? null : streamNarrow(expectedName),
      );
    };

    test('basic', () => {
      expectStream(`${streamGeneral.stream_id}-general`, [streamGeneral], 'general');
    });

    test('on stream link with wrong name: ID wins', () => {
      expectStream(`${streamGeneral.stream_id}-nonsense`, [streamGeneral], 'general');
      expectStream(`${streamGeneral.stream_id}-`, [streamGeneral], 'general');
    });

    test('on malformed stream link: treat as old format', () => {
      const expectAsName = name => expectStream(name, [streamGeneral], name);
      expectAsName(`${streamGeneral.stream_id}`);
      expectAsName(`-${streamGeneral.stream_id}`);
      expectAsName(`${streamGeneral.stream_id}nonsense-general`);
    });

    {
      const testTeam = eg.makeStream({ name: 'test-team' });
      const numbers = eg.makeStream({ name: '311' });
      const numbersHyphen = eg.makeStream({ name: '311-' });
      const numbersPlus = eg.makeStream({ name: '311-help' });
      const dashdash = eg.makeStream({ name: '--help' });

      test('on old stream link, for stream with hyphens or even looking like new-style', () => {
        expectStream('test-team', [testTeam], 'test-team');
        expectStream('311', [numbers], '311');
        expectStream('311-', [numbersHyphen], '311-');
        expectStream('311-help', [numbersPlus], '311-help');
        expectStream('--help', [dashdash], '--help');
      });

      test('on ambiguous new- or old-style: new wins', () => {
        const collider = { ...eg.makeStream({ name: 'collider' }), stream_id: 311 };
        expectStream('311', [numbers, collider], '311'); // malformed for new-style
        expectStream('311-', [numbersHyphen, collider], 'collider');
        expectStream('311-help', [numbersPlus, collider], 'collider');
      });
    }

    test('on old stream link', () => {
      expect(get('https://example.com/#narrow/stream/jest')).toEqual(streamNarrow('jest'));
      expect(get('https://example.com/#narrow/stream/bot.20testing')).toEqual(
        streamNarrow('bot testing'),
      );
      expect(get('https://example.com/#narrow/stream/jest.2EAPI')).toEqual(
        streamNarrow('jest.API'),
      );
      expect(get('https://example.com/#narrow/stream/stream')).toEqual(streamNarrow('stream'));
      expect(get('https://example.com/#narrow/stream/topic')).toEqual(streamNarrow('topic'));

      expect(() => get('https://example.com/#narrow/stream/jest.API')).toThrow();
    });

    test('on old stream link, without realm info', () => {
      expect(get('/#narrow/stream/jest')).toEqual(streamNarrow('jest'));
      expect(get('#narrow/stream/jest')).toEqual(streamNarrow('jest'));
    });
  });

  describe('on topic links', () => {
    test('basic', () => {
      const expectBasic = (operand, expectedTopic) => {
        const url = `#narrow/stream/${streamGeneral.stream_id}-general/topic/${operand}`;
        expect(get(url, [streamGeneral])).toEqual(topicNarrow('general', expectedTopic));
      };

      expectBasic('(no.20topic)', '(no topic)');
      expectBasic('lunch', 'lunch');
    });

    test('on old topic link, with dot-encoding', () => {
      expect(get('https://example.com/#narrow/stream/jest/topic/(no.20topic)')).toEqual(
        topicNarrow('jest', '(no topic)'),
      );

      expect(get('https://example.com/#narrow/stream/jest/topic/google.2Ecom')).toEqual(
        topicNarrow('jest', 'google.com'),
      );

      expect(() => get('https://example.com/#narrow/stream/jest/topic/google.com')).toThrow();

      expect(get('https://example.com/#narrow/stream/topic/topic/topic.20name')).toEqual(
        topicNarrow('topic', 'topic name'),
      );

      expect(get('https://example.com/#narrow/stream/topic/topic/stream')).toEqual(
        topicNarrow('topic', 'stream'),
      );

      expect(get('https://example.com/#narrow/stream/stream/topic/topic')).toEqual(
        topicNarrow('stream', 'topic'),
      );
    });

    test('on old topic link, without realm info', () => {
      expect(get('/#narrow/stream/stream/topic/topic')).toEqual(topicNarrow('stream', 'topic'));
      expect(get('#narrow/stream/stream/topic/topic')).toEqual(topicNarrow('stream', 'topic'));
    });
  });

  test('on group PM link', () => {
    const ids = `${userB.user_id},${userC.user_id}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group`)).toEqual(
      pmNarrowFromUsersUnsafe([userB, userC]),
    );
  });

  test('on group PM link including self', () => {
    // The webapp doesn't generate these, but best to handle them anyway.
    const ids = `${eg.selfUser.user_id},${userB.user_id},${userC.user_id}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group`)).toEqual(
      pmNarrowFromUsersUnsafe([userB, userC]),
    );
  });

  test('if any of the user ids are not found: return null', () => {
    const otherId = 1 + Math.max(...allUsersById.keys());
    const ids = `${userB.user_id},${otherId}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group`)).toEqual(null);
  });

  test('on a special link', () => {
    expect(get('https://example.com/#narrow/is/starred')).toEqual(STARRED_NARROW);
  });

  test('on a message link', () => {
    const ids = `${userB.user_id},${userC.user_id}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group/near/2`)).toEqual(
      pmNarrowFromUsersUnsafe([userB, userC]),
    );

    expect(get('https://example.com/#narrow/stream/jest/topic/test/near/1')).toEqual(
      topicNarrow('jest', 'test'),
    );

    expect(get('https://example.com/#narrow/stream/jest/subject/test/near/1')).toEqual(
      topicNarrow('jest', 'test'),
    );
  });
});

describe('getMessageIdFromLink', () => {
  test('not message link', () => {
    expect(getMessageIdFromLink('https://example.com/#narrow/is/private', realm)).toBe(0);
  });

  test('when link is a group link, return anchor message id', () => {
    expect(
      getMessageIdFromLink('https://example.com/#narrow/pm-with/1,3-group/near/1/', realm),
    ).toBe(1);
  });

  test('when link is a topic link, return anchor message id', () => {
    expect(
      getMessageIdFromLink('https://example.com/#narrow/stream/jest/topic/test/near/1', realm),
    ).toBe(1);
  });
});
