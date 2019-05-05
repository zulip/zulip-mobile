import { responseToActions } from '../eventActions';

console.log = () => {}; // eslint-disable-line

describe('responseToActions', () => {
  test('empty response return no actions', () => {
    const events = [];
    const actions = responseToActions({}, events);

    expect(actions).toEqual([]);
  });

  test('filter out unknown event types and some known ones', () => {
    const events = [{ type: 'some unknown type' }, { type: 'heartbeat' }];
    const actions = responseToActions({}, events);

    expect(actions).toEqual([]);
  });

  test('when known events process and return actions', () => {
    const event = { type: 'presence' };
    const events = [event];
    const actions = responseToActions({}, events);

    expect(actions).toHaveLength(1);
  });
});
