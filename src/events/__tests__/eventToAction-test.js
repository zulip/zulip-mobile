import * as logging from '../../utils/logging';
import eventToAction from '../eventToAction';

describe('eventToAction', () => {
  const state = {};

  test('filter out unknown event type', () => {
    logging.error.mockReturnValue();

    expect(eventToAction(state, { type: 'some unknown type' })).toBe(null);

    expect(logging.error.mock.calls).toHaveLength(1);
    logging.error.mockReset();
  });

  test('filter out a known boring event type', () => {
    const event = { type: 'heartbeat' };
    expect(eventToAction(state, event)).toBe(null);
  });

  test('for known event, process and return', () => {
    const event = { type: 'presence' };
    const action = eventToAction(state, event);
    expect(action).not.toBe(null);
  });
});
