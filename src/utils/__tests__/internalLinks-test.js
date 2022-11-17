/* @flow strict-local */
import invariant from 'invariant';

import type { Stream } from '../../types';
import { streamNarrow, topicNarrow, pmNarrowFromUsersUnsafe, STARRED_NARROW } from '../narrow';
import {
  isNarrowLink,
  getLinkType,
  getNarrowFromLink,
  getNearOperandFromLink,
  decodeHashComponent,
} from '../internalLinks';
import * as eg from '../../__tests__/lib/exampleData';
import { isUrlRelative } from '../url';

const realm = new URL('https://example.com');
const urlOnRealm = relativeUrl => {
  invariant(
    isUrlRelative(relativeUrl),
    'For absolute URLs, just use the one-argument `new URL(…)`.',
  );
  return new URL(relativeUrl, realm);
};

describe('isNarrowLink', () => {
  const cases: $ReadOnlyArray<[boolean, string, URL] | [boolean, string, URL, URL]> = [
    [true, 'legacy: stream name, no ID', urlOnRealm('#narrow/stream/jest')],
    [true, 'legacy: stream name, no ID, topic', urlOnRealm('#narrow/stream/jest/topic/topic1')],

    [true, 'with numeric stream ID', urlOnRealm('#narrow/stream/123-jest')],
    [true, 'with numeric stream ID and topic', urlOnRealm('#narrow/stream/123-jest/topic/topic1')],

    [true, 'with numeric pm user IDs', urlOnRealm('#narrow/pm-with/123-mark')],

    [false, 'wrong fragment', urlOnRealm('#nope')],
    [false, 'wrong path', urlOnRealm('/user_uploads/#narrow/stream/jest')],
    [false, 'wrong domain', new URL('https://another.com/#narrow/stream/jest')],

    [false, '#narrowly', urlOnRealm('#narrowly/stream/jest')],

    [false, 'double slash', new URL(`${realm.origin}//#narrow/stream/jest`)],
    [false, 'triple slash', new URL(`${realm.origin}///#narrow/stream/jest`)],

    [
      true,
      'with port',
      new URL('#narrow/stream/jest', 'https://example.com:444/'),
      new URL('https://example.com:444/'),
    ],

    // This one fails because our polyfilled URL implementation has IDNA stripped out.
    // [
    //   true,
    //   'same domain, punycoded host',
    //   new URL('https://example.xn--h2brj9c/#narrow/stream/jest'),
    //   new URL('https://example.भारत/'),
    // ], // FAILS
    [
      true,
      'punycodable host',
      new URL('#narrow/stream/jest', 'https://example.भारत/'),
      new URL('https://example.भारत/'),
    ],

    // This one fails because our polyfilled URL implementation has IDNA stripped out.
    // [
    //   true,
    //   'same domain, IDNA-mappable',
    //   new URL('https://ℯⅩªm🄿ₗℰ.ℭᴼⓂ/#narrow/stream/jest'),
    //   new URL('https://example.com'),
    // ], // FAILS

    [
      true,
      'ipv4 address',
      new URL('#narrow/stream/jest', 'http://192.168.0.1/'),
      new URL('http://192.168.0.1/'),
    ],
    // This one fails because our polyfilled URL implementation has IDNA stripped out.
    // [
    //   true,
    //   'same IPv4 address, IDNA-mappable',
    //   new URL('http://１𝟗𝟚。①⁶🯸．₀｡𝟭/#narrow/stream/jest'),
    //   new URL('http://192.168.0.1/'),
    // ], // FAILS

    // TODO: Add tests for IPv6.

    // These examples may seem weird, but a previous version accepted most of them.
    [
      false,
      'wrong domain, realm-like path, narrow-like fragment',
      // This one, except possibly the fragment, is a 100% realistic link
      // for innocent normal use.  The buggy old version narrowly avoided
      // accepting it... but would accept all the variations below.
      new URL(`https://web.archive.org/web/*/${urlOnRealm('#narrow/stream/jest').toString()}`),
    ],
    [
      false,
      'odd scheme, wrong domain, realm-like path, narrow-like fragment',
      new URL(`ftp://web.archive.org/web/*/${urlOnRealm('#narrow/stream/jest').toString()}`),
    ],
    [
      false,
      'same domain, realm-like path, narrow-like fragment',
      urlOnRealm(`web/*/${urlOnRealm('#narrow/stream/jest').toString()}`),
    ],
  ];

  /* $FlowFixMe[invalid-tuple-index]:
     realm_ is URL | void, but complains of out-of-bounds access */
  for (const [expected, description, url, realm_] of cases) {
    test(`${expected ? 'accept' : 'reject'} ${description}: ${url.toString()}`, () => {
      expect(isNarrowLink(url, realm_ ?? realm)).toBe(expected);
    });
  }
});

describe('getLinkType', () => {
  test('links to a different domain are of "non-narrow" type', () => {
    expect(getLinkType('https://google.com/some-path', realm)).toBe('non-narrow');
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

  const streamGeneral = eg.makeStream({ name: 'general' });

  const get = (url, streams: $ReadOnlyArray<Stream>) =>
    getNarrowFromLink(
      url,
      new URL('https://example.com'),
      new Map(streams.map(s => [s.stream_id, s])),
      new Map(streams.map(s => [s.name, s])),
      eg.selfUser.user_id,
    );

  test('on link to realm domain but not narrow: return null', () => {
    expect(get('https://example.com/user_uploads', [])).toEqual(null);
  });

  describe('on stream links', () => {
    // Tell ESLint to recognize `expectStream` as a helper function that
    // runs assertions.
    /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "expectStream"] }] */
    const expectStream = (operand, streams, expectedStream: null | Stream) => {
      expect(get(`#narrow/stream/${operand}`, streams)).toEqual(
        expectedStream === null ? null : streamNarrow(expectedStream.stream_id),
      );
    };

    test('basic', () => {
      expectStream(`${streamGeneral.stream_id}-general`, [streamGeneral], streamGeneral);
    });

    test('on stream link with wrong name: ID wins', () => {
      expectStream(`${streamGeneral.stream_id}-nonsense`, [streamGeneral], streamGeneral);
      expectStream(`${streamGeneral.stream_id}-`, [streamGeneral], streamGeneral);
    });

    test('on malformed stream link: reject', () => {
      expectStream(`-${streamGeneral.stream_id}`, [streamGeneral], null);
      expectStream(`${streamGeneral.stream_id}nonsense-general`, [streamGeneral], null);
    });

    {
      const testTeam = eg.makeStream({ name: 'test-team' });
      const numbers = eg.makeStream({ name: '311' });
      const numbersHyphen = eg.makeStream({ name: '311-' });
      const numbersPlus = eg.makeStream({ name: '311-help' });
      const dashdash = eg.makeStream({ name: '--help' });

      test('on old stream link, for stream with hyphens or even looking like new-style', () => {
        expectStream('test-team', [testTeam], testTeam);
        expectStream('311', [numbers], numbers);
        expectStream('311-', [numbersHyphen], numbersHyphen);
        expectStream('311-help', [numbersPlus], numbersPlus);
        expectStream('--help', [dashdash], dashdash);
      });

      test('on ambiguous new- or old-style: new wins', () => {
        const collider = eg.makeStream({ stream_id: 311, name: 'collider' });
        expectStream('311', [numbers, collider], collider);
        expectStream('311-', [numbersHyphen, collider], collider);
        expectStream('311-help', [numbersPlus, collider], collider);
      });
    }

    test('on old stream link', () => {
      const expectNameMatch = (operand, streamName) => {
        const stream = eg.makeStream({ name: streamName });
        expect(get(`https://example.com/#narrow/stream/${operand}`, [stream])).toEqual(
          streamNarrow(stream.stream_id),
        );
      };
      expectNameMatch('jest', 'jest');
      expectNameMatch('bot.20testing', 'bot testing');
      expectNameMatch('jest.2EAPI', 'jest.API');
      expectNameMatch('stream', 'stream');
      expectNameMatch('topic', 'topic');

      expect(() => get('https://example.com/#narrow/stream/jest.API', [])).toThrow();
    });

    test('on old stream link, without realm info', () => {
      expect(get(`/#narrow/stream/${eg.stream.name}`, [eg.stream])).toEqual(
        streamNarrow(eg.stream.stream_id),
      );
      expect(get(`#narrow/stream/${eg.stream.name}`, [eg.stream])).toEqual(
        streamNarrow(eg.stream.stream_id),
      );
    });
  });

  describe('on topic links', () => {
    test('basic', () => {
      const expectBasic = (operand, expectedTopic) => {
        const url = `#narrow/stream/${streamGeneral.stream_id}-general/topic/${operand}`;
        expect(get(url, [streamGeneral])).toEqual(
          topicNarrow(streamGeneral.stream_id, expectedTopic),
        );
      };

      expectBasic('(no.20topic)', '(no topic)');
      expectBasic('lunch', 'lunch');
    });

    test('on old topic link, with dot-encoding', () => {
      expect(
        get(`https://example.com/#narrow/stream/${eg.stream.name}/topic/(no.20topic)`, [eg.stream]),
      ).toEqual(topicNarrow(eg.stream.stream_id, '(no topic)'));

      expect(
        get(`https://example.com/#narrow/stream/${eg.stream.name}/topic/google.2Ecom`, [eg.stream]),
      ).toEqual(topicNarrow(eg.stream.stream_id, 'google.com'));

      expect(() =>
        get(`https://example.com/#narrow/stream/${eg.stream.name}/topic/google.com`, [eg.stream]),
      ).toThrow();

      expect(
        get(`https://example.com/#narrow/stream/${eg.stream.name}/topic/topic.20name`, [eg.stream]),
      ).toEqual(topicNarrow(eg.stream.stream_id, 'topic name'));

      expect(
        get(`https://example.com/#narrow/stream/${eg.stream.name}/topic/stream`, [eg.stream]),
      ).toEqual(topicNarrow(eg.stream.stream_id, 'stream'));

      expect(
        get(`https://example.com/#narrow/stream/${eg.stream.name}/topic/topic`, [eg.stream]),
      ).toEqual(topicNarrow(eg.stream.stream_id, 'topic'));
    });

    test('on old topic link, without realm info', () => {
      expect(get(`/#narrow/stream/${eg.stream.name}/topic/topic`, [eg.stream])).toEqual(
        topicNarrow(eg.stream.stream_id, 'topic'),
      );
      expect(get(`#narrow/stream/${eg.stream.name}/topic/topic`, [eg.stream])).toEqual(
        topicNarrow(eg.stream.stream_id, 'topic'),
      );
    });
  });

  test('on group PM link', () => {
    const ids = `${userB.user_id},${userC.user_id}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group`, [])).toEqual(
      pmNarrowFromUsersUnsafe([userB, userC]),
    );
  });

  test('on group PM link including self', () => {
    // The webapp doesn't generate these, but best to handle them anyway.
    const ids = `${eg.selfUser.user_id},${userB.user_id},${userC.user_id}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group`, [])).toEqual(
      pmNarrowFromUsersUnsafe([userB, userC]),
    );
  });

  test('on a special link', () => {
    expect(get('https://example.com/#narrow/is/starred', [])).toEqual(STARRED_NARROW);
  });

  test('on a message link', () => {
    const ids = `${userB.user_id},${userC.user_id}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group/near/2`, [])).toEqual(
      pmNarrowFromUsersUnsafe([userB, userC]),
    );

    expect(
      get(`https://example.com/#narrow/stream/${eg.stream.name}/topic/test/near/1`, [eg.stream]),
    ).toEqual(topicNarrow(eg.stream.stream_id, 'test'));

    expect(
      get(`https://example.com/#narrow/stream/${eg.stream.name}/subject/test/near/1`, [eg.stream]),
    ).toEqual(topicNarrow(eg.stream.stream_id, 'test'));
  });
});

describe('getNearOperandFromLink', () => {
  test('not message link', () => {
    expect(getNearOperandFromLink('https://example.com/#narrow/is/private', realm)).toBe(null);
    expect(getNearOperandFromLink('https://example.com/#narrow/stream/jest', realm)).toBe(null);
  });

  test('`near` is the only operator', () => {
    expect(getNearOperandFromLink('https://example.com/#narrow/near/1', realm)).toBe(1);
  });

  test('when link is a group link, return anchor message id', () => {
    expect(
      getNearOperandFromLink('https://example.com/#narrow/pm-with/1,3-group/near/1/', realm),
    ).toBe(1);
  });

  test('when link is a topic link, return anchor message id', () => {
    expect(
      getNearOperandFromLink('https://example.com/#narrow/stream/jest/topic/test/near/1', realm),
    ).toBe(1);
  });
});
