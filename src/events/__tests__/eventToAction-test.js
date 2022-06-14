/* @flow strict-local */
import invariant from 'invariant';

import * as logging from '../../utils/logging';
import * as eg from '../../__tests__/lib/exampleData';
import eventToAction from '../eventToAction';
import { EVENT_NEW_MESSAGE } from '../../actionConstants';
import { AvatarURL } from '../../utils/avatar';

function actionMatchesType(action, type): boolean %checks {
  return action !== null && action.type === type;
}

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

  describe('type: message', () => {
    const serverMessage = {
      ...eg.streamMessage(),
      reactions: [],
      avatar_url: null,
      edit_history: [],
      flags: undefined,
    };

    describe('recent servers', () => {
      const event = { type: 'message', message: serverMessage, flags: ['read'] };
      const action = eventToAction(state, event);

      test('EVENT_NEW_MESSAGE produced', () => {
        expect(actionMatchesType(action, EVENT_NEW_MESSAGE)).toBeTrue();
      });

      invariant(actionMatchesType(action, EVENT_NEW_MESSAGE), 'EVENT_NEW_MESSAGE produced');

      test('Adds event.flags', () => {
        expect(action.message.flags).toEqual(['read']);
      });

      test('Converts avatar_url', () => {
        expect(action.message.avatar_url).toBeInstanceOf(AvatarURL);
      });
    });
  });
});
