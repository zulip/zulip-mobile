import deepFreeze from 'deep-freeze';

import eventMiddleware from '../eventMiddleware';

describe('eventMiddleware', () => {
  test('if `event.flags` key exist, move it to `event.message.flags`', () => {
    const state = { session: {} };
    const event = {
      type: 'message',
      flags: ['mentioned'],
      message: {},
    };
    eventMiddleware(state, event);

    expect(event.flags).not.toBeDefined();
    expect(event.message.flags).toEqual(['mentioned']);
  });

  test('if `event.flags` do not exist, do not mutate event', () => {
    const state = { session: {} };
    const event = deepFreeze({
      type: 'message',
      message: {},
    });
    expect(() => eventMiddleware(state, event)).not.toThrow();
  });
});
