import { getPointer } from '../chatSelectors';

describe('getPointer', () => {
  test('when no messages, return zeroed pointer', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [],
        },
      },
    };
    expect(getPointer(state)).toEqual([0, 0]);
  });

  test('when single message, pointer ids are the same', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [
            { id: 123 },
          ],
        },
      }
    };
    expect(getPointer(state)).toEqual([123, 123]);
  });

  test('when 2 or more messages, pointer contains first and last message ids', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ],
        },
      },
    };
    expect(getPointer(state)).toEqual([1, 3]);
  });
});
