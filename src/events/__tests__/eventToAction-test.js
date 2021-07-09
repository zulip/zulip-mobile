/* @flow strict-local */
import * as logging from '../../utils/logging';
import * as eg from '../../__tests__/lib/exampleData';
import eventToAction from '../eventToAction';

describe('eventToAction', () => {
  const state = eg.plusReduxState;

  test('filter out unknown event type', () => {
    // $FlowFixMe[prop-missing]: teach Flow about Jest mocks
    logging.error.mockReturnValue();

    expect(eventToAction(state, { type: 'some unknown type' })).toBe(null);

    // $FlowFixMe[prop-missing]: teach Flow about Jest mocks
    expect(logging.error.mock.calls).toHaveLength(1);
    // $FlowFixMe[prop-missing]: teach Flow about Jest mocks
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
