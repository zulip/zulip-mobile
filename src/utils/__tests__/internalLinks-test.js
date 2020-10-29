/* @flow strict-local */

import type { User } from '../../api/modelTypes';
import { streamNarrow, topicNarrow, groupNarrow, STARRED_NARROW } from '../narrow';
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
  test('when link is external, return false', () => {
    expect(isInternalLink('https://example.com', new URL('https://another.com'))).toBe(false);
  });

  test('when link is internal, but not in app, return false', () => {
    expect(isInternalLink('https://example.com/user_uploads', realm)).toBe(false);
  });

  test('when link is internal and in app, return true', () => {
    expect(isInternalLink('https://example.com/#narrow/stream/jest', realm)).toBe(true);
  });

  test('when link is relative and in app, return true', () => {
    expect(isInternalLink('#narrow/stream/jest/topic/topic1', realm)).toBe(true);
    expect(isInternalLink('/#narrow/stream/jest', realm)).toBe(true);
  });

  test('links including IDs are also recognized', () => {
    expect(isInternalLink('#narrow/stream/123-jest/topic/topic1', realm)).toBe(true);
    expect(isInternalLink('/#narrow/stream/123-jest', realm)).toBe(true);
    expect(isInternalLink('/#narrow/pm-with/123-mark', realm)).toBe(true);
  });
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
  const usersById: Map<number, User> = new Map(
    [eg.selfUser, userB, userC].map(u => [u.user_id, u]),
  );

  const streamGeneral = eg.makeStream({ name: 'general' });

  const get = (url, streams = []) =>
    getNarrowFromLink(
      url,
      new URL('https://example.com'),
      usersById,
      new Map(streams.map(s => [s.stream_id, s])),
      eg.selfUser.user_id,
    );

  test('on link to realm domain but not narrow: return null', () => {
    expect(get('https://example.com/user_uploads')).toEqual(null);
  });

  describe('on stream links', () => {
    // Tell Jest to recognize `expectStream` as a helper function that
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
      groupNarrow([userB.email, userC.email]),
    );
  });

  test('on group PM link including self', () => {
    // The webapp doesn't generate these, but best to handle them anyway.
    const ids = `${eg.selfUser.user_id},${userB.user_id},${userC.user_id}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group`)).toEqual(
      groupNarrow([userB.email, userC.email]),
    );
  });

  test('if any of the user ids are not found: return null', () => {
    const otherId = 1 + Math.max(...usersById.keys());
    const ids = `${userB.user_id},${otherId}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group`)).toEqual(null);
  });

  test('on a special link', () => {
    expect(get('https://example.com/#narrow/is/starred')).toEqual(STARRED_NARROW);
  });

  test('on a message link', () => {
    const ids = `${userB.user_id},${userC.user_id}`;
    expect(get(`https://example.com/#narrow/pm-with/${ids}-group/near/2`)).toEqual(
      groupNarrow([userB.email, userC.email]),
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
