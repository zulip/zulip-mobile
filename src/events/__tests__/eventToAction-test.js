import eventToAction from '../eventToAction';

console.log = () => {}; // eslint-disable-line

describe('eventToAction', () => {
  const state = {};

  test('filter out unknown event type', () => {
    const event = { type: 'some unknown type' };
    expect(eventToAction(state, event)).toBe(null);
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
