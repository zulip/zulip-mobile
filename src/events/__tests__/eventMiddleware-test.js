import eventMiddleware from '../eventMiddleware';
import { NULL_ARRAY } from '../../nullObjects';

describe('eventMiddleware', () => {
  test('if `event.flags` key exists, move it to `event.message.flags`', () => {
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

  test('if `event.flags` does not exist, set message.flags to an empty array', () => {
    const state = { session: {} };
    const event = {
      type: 'message',
      message: {},
    };
    eventMiddleware(state, event);
    expect(event.message.flags).toEqual(NULL_ARRAY);
  });
});
