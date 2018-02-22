/* eslint-disable spellcheck/spell-checker */
import {
  getFullUrl,
  getResource,
  isUrlOnRealm,
  isUrlInAppLink,
  isMessageLink,
  isStreamLink,
  isTopicLink,
  isGroupLink,
  isSpecialLink,
  isEmojiUrl,
  getEmojiUrl,
  getNarrowFromLink,
  getMessageIdFromLink,
  fixRealmUrl,
} from '../url';

import { streamNarrow, topicNarrow } from '../narrow';

describe('getFullUrl', () => {
  test('when uri contains domain, do not change', () => {
    const url = getFullUrl('https://example.com/img.gif', '');
    expect(url).toEqual('https://example.com/img.gif');
  });

  test('when uri does not contain domain, append realm', () => {
    const url = getFullUrl('/img.gif', 'https://example.com');
    expect(url).toEqual('https://example.com/img.gif');
  });

  test('recognize relative uris', () => {
    const url = getFullUrl('#something', 'https://example.com');
    expect(url).toEqual('https://example.com/#something');
  });
});

describe('getResource', () => {
  test('when uri contains domain, do not change, add auth headers', () => {
    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: 'Basic am9obmRvZUBleGFtcGxlLmNvbTpzb21lQXBpS2V5',
      },
    };
    const resource = getResource('https://example.com/img.gif', {
      realm: '',
      apiKey: 'someApiKey',
      email: 'johndoe@example.com',
    });
    expect(resource).toEqual(expectedResult);
  });

  test('when uri does not contain domain, append realm, add auth headers', () => {
    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: 'Basic dW5kZWZpbmVkOnNvbWVBcGlLZXk=',
      },
    };
    const resource = getResource('/img.gif', {
      realm: 'https://example.com',
      apiKey: 'someApiKey',
    });
    expect(resource).toEqual(expectedResult);
  });

  test('when uri is on different domain than realm, do not include auth headers', () => {
    const expectedResult = {
      uri: 'https://another.com/img.gif',
    };
    const resource = getResource('https://another.com/img.gif', {
      realm: 'https://example.com',
      apiKey: 'someApiKey',
    });
    expect(resource).toEqual(expectedResult);
  });
});

describe('isUrlOnRealm', () => {
  test('when link is on realm, return true', () => {
    expect(isUrlOnRealm('/#narrow/stream/jest', 'https://example.com')).toBe(true);

    expect(isUrlOnRealm('https://example.com/#narrow/stream/jest', 'https://example.com')).toBe(
      true,
    );

    expect(isUrlOnRealm('#narrow/#near/1', 'https://example.com')).toBe(true);
  });

  test('when link is on not realm, return false', () => {
    expect(isUrlOnRealm('https://demo.example.com', 'https://example.com')).toBe(false);

    expect(isUrlOnRealm('www.google.com', 'https://example.com')).toBe(false);
  });
});

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
    expect(
      isUrlInAppLink('#narrow/stream/jest/topic/topic1', 'https://example.com/#narrow/stream/jest'),
    ).toBe(true);

    expect(isUrlInAppLink('/#narrow/stream/jest', 'https://example.com/#narrow/stream/jest')).toBe(
      true,
    );
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
  test('only in-app link containing "topic" is a topic link', () => {
    expect(
      isTopicLink('https://example.com/#narrow/pm-with/1,2-group', 'https://example.com'),
    ).toBe(false);

    expect(isTopicLink('https://example.com/#narrow/stream/jest', 'https://example.com')).toBe(
      false,
    );

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
        'https://example.com/#narrow/stream/stream/topic/topic/near/',
        'https://example.com',
      ),
    ).toBe(false);

    expect(
      isTopicLink(
        'https://example.com/#narrow/stream/stream/topic/topic/near/1',
        'https://example.com',
      ),
    ).toBe(true);

    expect(isTopicLink('https://example.com/#narrow/stream/topic/', 'https://example.com')).toBe(
      false,
    );
  });
});

describe('isGroupLink', () => {
  test('only in-app link containing "pm-with" is a group link', () => {
    expect(
      isGroupLink('https://example.com/#narrow/stream/jest/topic/test', 'https://example.com'),
    ).toBe(false);
    expect(
      isGroupLink('https://example.com/#narrow/pm-with/1,2-group', 'https://example.com'),
    ).toBe(true);
    expect(
      isGroupLink('https://example.com/#narrow/pm-with/1,2-group/near/1', 'https://example.com'),
    ).toBe(true);
    expect(
      isGroupLink(
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

describe('isEmojiUrl', () => {
  test('when url is on realm, but not an emoji url', () => {
    const result = isEmojiUrl('/user_uploads/abc.png', 'https://example.com');
    expect(result).toBe(false);
  });
  test('when url is on realm and emoji', () => {
    const result = isEmojiUrl(
      '/static/generated/emoji/images/emoji/unicode/1f680.png',
      'https://example.com',
    );
    expect(result).toBe(true);
  });
});

describe('getEmojiUrl', () => {
  test('when unicode is passed, output relative link on server', () => {
    const url = getEmojiUrl('1f680');
    expect(url).toBe('/static/generated/emoji/images/emoji/unicode/1f680.png');
  });
});

describe('getNarrowFromLink', () => {
  const users = [
    { email: 'abc@example.com', id: 1 },
    { email: 'xyz@example.com', id: 2 },
    { email: 'def@example.com', id: 3 },
  ];

  test('when link is not in-app link, return default homeNarrow', () => {
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
        users,
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
        users,
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
        users,
      ),
    ).toEqual(topicNarrow('jest', 'test'));

    expect(
      getNarrowFromLink(
        'https://example.com/#narrow/stream/jest/subject/test/near/1',
        'https://example.com',
        users,
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

describe('fixRealmUrl', () => {
  test('undefined input results in empty string', () => {
    expect(fixRealmUrl()).toEqual('');
  });

  test('when a realm url is missing a protocol, prepend https', () => {
    expect(fixRealmUrl('example.com')).toEqual('https://example.com');
  });

  test('when a realm url has a trailing "/" remove it', () => {
    expect(fixRealmUrl('https://example.com/')).toEqual('https://example.com');
  });

  test('when input url is correct, do not change it', () => {
    expect(fixRealmUrl('https://example.com')).toEqual('https://example.com');
  });

  test('remove white-space around input', () => {
    expect(fixRealmUrl(' https://example.com/  ')).toEqual('https://example.com');
  });

  test('remove white-space inside input', () => {
    const result = fixRealmUrl('https://subdomain   .example.  com/  ');
    expect(result).toEqual('https://subdomain.example.com');
  });
});
