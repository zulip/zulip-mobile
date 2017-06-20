/* @flow */
import {
  EVENT_REALM_EMOJI_UPDATE,
} from '../../actionConstants';
import realmEmojiReducers from '../realmEmojiReducers';

describe('accountReducers', () => {
  describe('EVENT_REALM_EMOJI_UPDATE', () => {
    test('update state to new realm_emoji', () => {
      const prevState = {
        realm_emoji: {},
      };
      const action = {
        eventId: 4,
        id: 4,
        op: 'update',
        realm_emoji: {
          customEmoji1: {},
          customEmoji2: {},
        },
        type: EVENT_REALM_EMOJI_UPDATE
      };
      const expectedState = {
        realm_emoji: {
          customEmoji1: {},
          customEmoji2: {},
        }
      };

      const newState = realmEmojiReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
