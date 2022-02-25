/* @flow strict-local */
import Immutable from 'immutable';

import { objectFromEntries } from '../../jsBackport';
import { makeUserId, type UserId } from '../../api/idTypes';
import type { UserStatusesState } from '../../types';
import type { UserStatusUpdate } from '../../api/modelTypes';
import * as eg from '../../__tests__/lib/exampleData';
import { EVENT_USER_STATUS_UPDATE } from '../../actionConstants';
import { reducer, kUserStatusZero } from '../userStatusesModel';

describe('reducer', () => {
  const testUserStatusesState: UserStatusesState = Immutable.Map([
    [makeUserId(1), { away: true, status_text: null, status_emoji: null }],
    [makeUserId(2), { away: false, status_text: 'Hello, world', status_emoji: null }],
  ]);

  // TODO: vary this data
  const mkEmoji = () => ({
    emoji_name: 'thumbs_up',
    emoji_code: '1f44d',
    reaction_type: 'unicode_emoji',
  });

  const emojiUnset = {
    emoji_name: '',
    emoji_code: '',
    reaction_type: '',
  };

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      expect(reducer(testUserStatusesState, eg.action.account_switch)).toEqual(Immutable.Map());
    });
  });

  describe('REGISTER_COMPLETE', () => {
    const mkAction = (...args: Array<[UserId, UserStatusUpdate]>) =>
      eg.mkActionRegisterComplete({
        user_status: objectFromEntries(args.map(([userId, update]) => [userId.toString(), update])),
      });

    test('when `user_status` data is provided init state with it', () => {
      expect(
        reducer(
          Immutable.Map(),
          mkAction(
            [makeUserId(1), { away: true }],
            [makeUserId(2), { status_text: 'Hello, world' }],
          ),
        ),
      ).toEqual(testUserStatusesState);
    });

    test('handles older back-ends that do not have `user_status` data by resetting the state', () => {
      expect(
        reducer(testUserStatusesState, eg.mkActionRegisterComplete({ user_status: undefined })),
      ).toEqual(Immutable.Map());
    });

    test('away set', () => {
      expect(reducer(Immutable.Map(), mkAction([eg.selfUser.user_id, { away: true }]))).toEqual(
        Immutable.Map([[eg.selfUser.user_id, { ...kUserStatusZero, away: true }]]),
      );
    });

    test('text set', () => {
      expect(
        reducer(Immutable.Map(), mkAction([eg.selfUser.user_id, { status_text: 'foo' }])),
      ).toEqual(Immutable.Map([[eg.selfUser.user_id, { ...kUserStatusZero, status_text: 'foo' }]]));
    });

    test('emoji set', () => {
      const emoji = mkEmoji();
      expect(reducer(Immutable.Map(), mkAction([eg.selfUser.user_id, { ...emoji }]))).toEqual(
        Immutable.Map([[eg.selfUser.user_id, { ...kUserStatusZero, status_emoji: emoji }]]),
      );
    });

    test('all components set together', () => {
      const emoji = mkEmoji();
      expect(
        reducer(
          Immutable.Map(),
          mkAction([eg.selfUser.user_id, { away: true, status_text: 'Hello, world!', ...emoji }]),
        ),
      ).toEqual(
        Immutable.Map([
          [eg.selfUser.user_id, { away: true, status_text: 'Hello, world!', status_emoji: emoji }],
        ]),
      );
    });
  });

  describe('EVENT_USER_STATUS_UPDATE', () => {
    const mkAction = (update: UserStatusUpdate, userId = eg.selfUser.user_id) => ({
      id: 0,
      type: EVENT_USER_STATUS_UPDATE,
      user_id: userId,
      ...update,
    });

    test('when the user does not already have entry add a key by their `user_id`', () => {
      expect(
        reducer(
          Immutable.Map([[eg.selfUser.user_id, kUserStatusZero]]),
          mkAction({ away: true }, eg.otherUser.user_id),
        ),
      ).toEqual(
        Immutable.Map([
          [eg.selfUser.user_id, kUserStatusZero],
          [eg.otherUser.user_id, { ...kUserStatusZero, away: true }],
        ]),
      );
    });

    test('if the user already has user status stored update their key', () => {
      expect(
        reducer(
          Immutable.Map([
            [eg.selfUser.user_id, { away: false, status_text: 'foo', status_emoji: null }],
          ]),
          mkAction({ status_text: 'bar' }),
        ),
      ).toEqual(
        Immutable.Map([
          [eg.selfUser.user_id, { away: false, status_text: 'bar', status_emoji: null }],
        ]),
      );
    });

    test('when the user_ status text is updated this is reflected in the state', () => {
      expect(reducer(Immutable.Map(), mkAction({ status_text: 'Hello, world!' }))).toEqual(
        Immutable.Map([
          [eg.selfUser.user_id, { away: false, status_text: 'Hello, world!', status_emoji: null }],
        ]),
      );
    });

    test('away, text, and emoji status components can be set in one event', () => {
      const emoji = mkEmoji();
      expect(
        reducer(
          Immutable.Map([[eg.selfUser.user_id, kUserStatusZero]]),
          mkAction({ away: true, status_text: 'Hello, world!', ...emoji }),
        ),
      ).toEqual(
        Immutable.Map([
          [eg.selfUser.user_id, { away: true, status_text: 'Hello, world!', status_emoji: emoji }],
        ]),
      );
    });

    test('away, text, and emoji status components can be unset in one event', () => {
      const emoji = mkEmoji();
      expect(
        reducer(
          Immutable.Map([
            [
              eg.selfUser.user_id,
              { away: true, status_text: 'Hello, world!', status_emoji: emoji },
            ],
          ]),
          mkAction({ away: false, status_text: '', ...emojiUnset }),
        ),
      ).toEqual(Immutable.Map([[eg.selfUser.user_id, kUserStatusZero]]));
    });
  });
});
