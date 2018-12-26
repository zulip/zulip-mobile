/* eslint-disable spellcheck/spell-checker */
import {
  isUrlInAppLink,
  isMessageLink,
  isStreamLink,
  isTopicLink,
  isPmLink,
  isSpecialLink,
  getNarrowFromLink,
  getMessageIdFromLink,
} from '../internalLinks';

import { streamNarrow, topicNarrow } from '../narrow';

describe('isUrlInAppLink', () => {
  test('when link is external, return false', () => {
    expect(isUrlInAppLink('https://example.com', 'https://another.com')).toBe(false);
  });

  test('when link is internal, but not in app, return false', () => {
    expect(isUrlInAppLink('https://example.com/user_uploads', 'https://example.com')).toBe(false);
  });

  test('when link is internal and in app, return true', () => {
    expect(isUrlInAppLink('https://example.com/#narrow/stream/jest', 'https://example.com')).toBe(
      true,
    );
  });

  test('when link is relative and in app, return true', () => {
    expect(isUrlInAppLink('#narrow/stream/jest/topic/topic1', 'https://example.com')).toBe(true);
    expect(isUrlInAppLink('/#narrow/stream/jest', 'https://example.com')).toBe(true);
  });

  test('links including IDs are also recognized', () => {
    expect(isUrlInAppLink('#narrow/stream/123-jest/topic/topic1', 'https://example.com')).toBe(
      true,
    );
    expect(isUrlInAppLink('/#narrow/stream/123-jest', 'https://example.com')).toBe(true);
    expect(isUrlInAppLink('/#narrow/pm-with/123-mark', 'https://example.com')).toBe(true);
  });
});

describe('isMessageLink', () => {
  test('only in-app link containing "near/<message-id>" is a message link', () => {
    expect(isMessageLink('https://example.com/#narrow/stream/jest', 'https://example.com')).toBe(
      false,
    );
    expect(isMessageLink('https://example.com/#narrow/#near/1', 'https://example.com')).toBe(true);
  });
});

describe('isStreamLink', () => {
  test('only in-app link containing "stream" is a stream link', () => {
    expect(
      isStreamLink('https://example.com/#narrow/pm-with/1,2-group', 'https://example.com'),
    ).toBe(false);
    expect(isStreamLink('https://example.com/#narrow/stream/jest', 'https://example.com')).toBe(
      true,
    );
    expect(isStreamLink('https://example.com/#narrow/stream/stream/', 'https://example.com')).toBe(
      true,
    );
  });
});

describe('isTopicLink', () => {
  test('when a url is not a topic narrow return false', () => {
    expect(
      isTopicLink('https://example.com/#narrow/pm-with/1,2-group', 'https://example.com'),
    ).toBe(false);
    expect(isTopicLink('https://example.com/#narrow/stream/jest', 'https://example.com')).toBe(
      false,
    );

    expect(
      isTopicLink(
        'https://example.com/#narrow/stream/stream/topic/topic/near/',
        'https://example.com',
      ),
    ).toBe(false);

    expect(isTopicLink('https://example.com/#narrow/stream/topic/', 'https://example.com')).toBe(
      false,
    );
  });

  test('when a url is a topic narrow return true', () => {
    expect(
      isTopicLink('https://example.com/#narrow/stream/jest/topic/test', 'https://example.com'),
    ).toBe(true);

    expect(
      isTopicLink(
        'https://example.com/#narrow/stream/mobile/subject/topic/near/378333',
        'https://example.com',
      ),
    ).toBe(true);

    expect(
      isTopicLink('https://example.com/#narrow/stream/mobile/topic/topic/', 'https://example.com'),
    ).toBe(true);

    expect(
      isTopicLink(
        'https://example.com/#narrow/stream/stream/topic/topic/near/1',
        'https://example.com',
      ),
    ).toBe(true);

    expect(
      isTopicLink(
        'https://example.com/#narrow/stream/stream/subject/topic/near/1',
        'https://example.com',
      ),
    ).toBe(true);

    expect(isTopicLink('/#narrow/stream/stream/subject/topic', 'https://example.com')).toBe(true);
  });
});

describe('isPmLink', () => {
  test('only in-app link containing "pm-with" is a group link', () => {
    expect(
      isPmLink('https://example.com/#narrow/stream/jest/topic/test', 'https://example.com'),
    ).toBe(false);
    expect(isPmLink('https://example.com/#narrow/pm-with/1,2-group', 'https://example.com')).toBe(
      true,
    );
    expect(
      isPmLink('https://example.com/#narrow/pm-with/1,2-group/near/1', 'https://example.com'),
    ).toBe(true);
    expect(
      isPmLink(
        'https://example.com/#narrow/pm-with/a.40b.2Ecom.c.d.2Ecom/near/3',
        'https://example.com',
      ),
    ).toBe(true);
  });
});

describe('isSpecialLink', () => {
  test('only in-app link containing "is" is a special link', () => {
    expect(
      isSpecialLink('https://example.com/#narrow/stream/jest/topic/test', 'https://example.com'),
    ).toBe(false);

    expect(isSpecialLink('https://example.com/#narrow/is/private', 'https://example.com')).toBe(
      true,
    );

    expect(isSpecialLink('https://example.com/#narrow/is/starred', 'https://example.com')).toBe(
      true,
    );

    expect(isSpecialLink('https://example.com/#narrow/is/mentioned', 'https://example.com')).toBe(
      true,
    );

    expect(isSpecialLink('https://example.com/#narrow/is/men', 'https://example.com')).toBe(false);

    expect(isSpecialLink('https://example.com/#narrow/is/men/stream', 'https://example.com')).toBe(
      false,
    );

    expect(isSpecialLink('https://example.com/#narrow/are/men/stream', 'https://example.com')).toBe(
      false,
    );
  });
});

describe('getNarrowFromLink', () => {
  const usersById = new Map([
    [1, { email: 'abc@example.com', user_id: 1 }],
    [2, { email: 'xyz@example.com', user_id: 2 }],
    [3, { email: 'def@example.com', user_id: 3 }],
  ]);

  test('when link is not in-app link, return default HOME_NARROW', () => {
    expect(getNarrowFromLink('https://example.com/user_uploads', 'https://example.com')).toEqual(
      [],
    );
  });

  test('when link is stream link, return matching streamNarrow', () => {
    expect(
      getNarrowFromLink('https://example.com/#narrow/stream/jest', 'https://example.com'),
    ).toEqual(streamNarrow('jest'));

    expect(
      getNarrowFromLink('https://example.com/#narrow/stream/bot.20testing', 'https://example.com'),
    ).toEqual(streamNarrow('bot testing'));

    expect(
      getNarrowFromLink('https://example.com/#narrow/stream/jest.API', 'https://example.com'),
    ).toEqual(streamNarrow('jest.API'));

    expect(
      getNarrowFromLink('https://example.com/#narrow/stream/stream', 'https://example.com'),
    ).toEqual(streamNarrow('stream'));

    expect(
      getNarrowFromLink('https://example.com/#narrow/stream/topic', 'https://example.com'),
    ).toEqual(streamNarrow('topic'));
  });

  test('when link is stream link, without realm info, return matching streamNarrow', () => {
    expect(getNarrowFromLink('/#narrow/stream/jest', 'https://example.com')).toEqual(
      streamNarrow('jest'),
    );
    expect(getNarrowFromLink('#narrow/stream/jest', 'https://example.com')).toEqual(
      streamNarrow('jest'),
    );
  });

  test('when link is a topic link and encoded, decode stream and topic names and return matching streamNarrow and topicNarrow', () => {
    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/stream/jest/topic/(no.20topic)',
        'https://example.com',
      ),
    ).toEqual(topicNarrow('jest', '(no topic)'));

    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/stream/jest/topic/google.com',
        'https://example.com',
      ),
    ).toEqual(topicNarrow('jest', 'google.com'));

    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/stream/topic/topic/topic.20name',
        'https://example.com',
      ),
    ).toEqual(topicNarrow('topic', 'topic name'));

    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/stream/topic/topic/stream',
        'https://example.com',
      ),
    ).toEqual(topicNarrow('topic', 'stream'));

    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/stream/stream/topic/topic',
        'https://example.com',
      ),
    ).toEqual(topicNarrow('stream', 'topic'));
  });

  test('when link is pointing to a topic without realm info, return matching topicNarrow', () => {
    expect(getNarrowFromLink('/#narrow/stream/stream/topic/topic', 'https://example.com')).toEqual(
      topicNarrow('stream', 'topic'),
    );
    expect(getNarrowFromLink('#narrow/stream/stream/topic/topic', 'https://example.com')).toEqual(
      topicNarrow('stream', 'topic'),
    );
  });

  test('when link is a group link, return matching groupNarrow', () => {
    const expectedValue = [
      {
        operator: 'pm-with',
        operand: 'abc@example.com,xyz@example.com,def@example.com',
      },
    ];
    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/pm-with/1,2,3-group',
        'https://example.com',
        usersById,
      ),
    ).toEqual(expectedValue);
  });

  test('when link is a special link, return matching specialNarrow', () => {
    const expectedValue = [
      {
        operator: 'is',
        operand: 'starred',
      },
    ];
    expect(
      getNarrowFromLink('https://example.com/#narrow/is/starred', 'https://example.com'),
    ).toEqual(expectedValue);
  });

  test('when link is a message link, return matching narrow', () => {
    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/pm-with/1,3-group/near/2',
        'https://example.com',
        usersById,
      ),
    ).toEqual([
      {
        operator: 'pm-with',
        operand: 'abc@example.com,def@example.com',
      },
    ]);

    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/stream/jest/topic/test/near/1',
        'https://example.com',
        usersById,
      ),
    ).toEqual(topicNarrow('jest', 'test'));

    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/stream/jest/subject/test/near/1',
        'https://example.com',
        usersById,
      ),
    ).toEqual(topicNarrow('jest', 'test'));
  });
});

describe('getMessageIdFromLink', () => {
  test('not message link', () => {
    expect(
      getMessageIdFromLink('https://example.com/#narrow/is/private', 'https://example.com'),
    ).toBe(0);
  });

  test('when link is a group link, return anchor message id', () => {
    expect(
      getMessageIdFromLink(
        'https://example.com/#narrow/pm-with/1,3-group/near/1/',
        'https://example.com',
      ),
    ).toBe(1);
  });

  test('when link is a topic link, return anchor message id', () => {
    expect(
      getMessageIdFromLink(
        'https://example.com/#narrow/stream/jest/topic/test/near/1',
        'https://example.com',
      ),
    ).toBe(1);
  });
});
