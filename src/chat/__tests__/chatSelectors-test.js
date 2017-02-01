import { getPointer } from '../chatSelectors';

describe('getPointer', () => {
  test('return max pointer when there are no messages', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [],
        },
      },
    };
    expect(getPointer(state)).toEqual({
      older: Number.MAX_SAFE_INTEGER,
      newer: Number.MAX_SAFE_INTEGER,
    });
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
    expect(getPointer(state)).toEqual({ older: 123, newer: 123 });
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
    expect(getPointer(state)).toEqual({ older: 1, newer: 3 });
  });
});
