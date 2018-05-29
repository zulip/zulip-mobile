import deepFreeze from 'deep-freeze';

import aggregateReactions from '../aggregateReactions';

describe('aggregateReactions', () => {
  test('empty input results in empty aggregate list', () => {
    const reactions = deepFreeze([]);

    const expectedResult = [];

    const actualResult = aggregateReactions(reactions);

    expect(actualResult).toEqual(expectedResult);
  });

  test('a single reaction, results in a single aggregate', () => {
    const reactions = deepFreeze([{ emoji_name: 'emoji' }]);

    const expectedResult = [
      {
        name: 'emoji',
        count: 1,
        selfReacted: false,
      },
    ];

    const actualResult = aggregateReactions(reactions);

    expect(actualResult).toEqual(expectedResult);
  });

  test('every duplicate reaction is aggregated to a single one with appropriate count', () => {
    const reactions = deepFreeze([
      { emoji_name: '1' },
      { emoji_name: '2' },
      { emoji_name: '1' },
      { emoji_name: '1' },
      { emoji_name: '3' },
      { emoji_name: '2' },
    ]);

    const expectedResult = [
      {
        name: '1',
        count: 3,
        selfReacted: false,
      },
      {
        name: '2',
        count: 2,
        selfReacted: false,
      },
      {
        name: '3',
        count: 1,
        selfReacted: false,
      },
    ];

    const actualResult = aggregateReactions(reactions);

    expect(actualResult).toEqual(expectedResult);
  });

  test('every duplicate reaction is aggregated, ignoring self', () => {
    const reactions = deepFreeze([
      { emoji_name: '1', user: { email: 'another@example.com' } },
      { emoji_name: '2', user: { email: 'me@example.com' } },
      { emoji_name: '2', user: { email: 'another@example.com' } },
      { emoji_name: '3', user: { email: 'third@example.com' } },
    ]);

    const expectedResult = [
      {
        name: '1',
        count: 1,
        selfReacted: false,
      },
      {
        name: '2',
        count: 2,
        selfReacted: true,
      },
      {
        name: '3',
        count: 1,
        selfReacted: false,
      },
    ];

    const actualResult = aggregateReactions(reactions, 'me@example.com');

    expect(actualResult).toEqual(expectedResult);
  });
});
