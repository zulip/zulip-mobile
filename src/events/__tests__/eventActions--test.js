import { responseToActions } from '../eventActions';

console.log = () => {}; // eslint-disable-line

describe('responseToActions', () => {
  test('empty response return no actions', () => {
    const response = { events: [] };
    const actions = responseToActions({}, response);

    expect(actions).toEqual([]);
  });

  test('filter out unknown event types and some known ones', () => {
    const response = { events: [{ type: 'some unknown type' }, { type: 'heartbeat' }] };
    const actions = responseToActions({}, response);

    expect(actions).toEqual([]);
  });

  test('when known events process and return actions', () => {
    const event = { type: 'presence' };
    const response = { events: [event] };
    const actions = responseToActions({}, response);

    expect(actions.length).toBe(1);
  });
});
