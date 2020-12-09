/* @flow strict-local */
import Immutable from 'immutable';

import { getRecentConversations } from '../pmConversationsSelectors';
import { ALL_PRIVATE_NARROW_STR } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('getRecentConversations', () => {
  const userJohn = eg.makeUser();
  const userMark = eg.makeUser();

  test('when no messages, return no conversations', () => {
    const state = eg.reduxState({
      realm: eg.realmState({ email: eg.selfUser.email }),
      users: [eg.selfUser],
      narrows: Immutable.Map({
        [ALL_PRIVATE_NARROW_STR]: [],
      }),
      unread: {
        ...eg.baseReduxState.unread,
        pms: [],
        huddles: [],
      },
    });

    const actual = getRecentConversations(state);

    expect(actual).toEqual([]);
  });

  test('returns unique list of recipients, includes conversations with self', () => {
    const meAndJohnPm1 = eg.pmMessage({ id: 1, recipients: [eg.selfUser, userJohn] });
    const meAndMarkPm = eg.pmMessage({ id: 2, recipients: [eg.selfUser, userMark] });
    const meAndJohnPm2 = eg.pmMessage({ id: 3, recipients: [eg.selfUser, userJohn] });
    const meOnlyPm = eg.pmMessage({ id: 4, recipients: [eg.selfUser] });
    const meJohnAndMarkPm = eg.pmMessage({ id: 0, recipients: [eg.selfUser, userJohn, userMark] });

    const state = eg.reduxState({
      realm: eg.realmState({ email: eg.selfUser.email }),
      users: [eg.selfUser, userJohn, userMark],
      narrows: Immutable.Map({
        [ALL_PRIVATE_NARROW_STR]: [
          meJohnAndMarkPm.id,
          meAndJohnPm1.id,
          meAndMarkPm.id,
          meAndJohnPm2.id,
          meOnlyPm.id,
        ],
      }),
      messages: {
        [meAndJohnPm1.id]: meAndJohnPm1,
        [meAndMarkPm.id]: meAndMarkPm,
        [meAndJohnPm2.id]: meAndJohnPm2,
        [meOnlyPm.id]: meOnlyPm,
        [meJohnAndMarkPm.id]: meJohnAndMarkPm,
      },
      unread: {
        ...eg.baseReduxState.unread,
        pms: [
          {
            sender_id: eg.selfUser.user_id,
            unread_message_ids: [meOnlyPm.id],
          },
          {
            sender_id: userJohn.user_id,
            unread_message_ids: [meAndJohnPm1.id, meAndJohnPm2.id],
          },
          {
            sender_id: userMark.user_id,
            unread_message_ids: [meAndMarkPm.id],
          },
        ],
        huddles: [
          {
            user_ids_string: [eg.selfUser.user_id, userJohn.user_id, userMark.user_id]
              .sort((a, b) => a - b)
              .map(String)
              .join(','),
            unread_message_ids: [5], // TODO: where does this come from???
          },
        ],
      },
    });

    const expectedResult = [
      {
        key: eg.selfUser.user_id.toString(),
        keyRecipients: [eg.selfUser],
        msgId: meOnlyPm.id,
        unread: 1,
      },
      {
        key: userJohn.user_id.toString(),
        keyRecipients: [userJohn],
        msgId: meAndJohnPm2.id,
        unread: 2,
      },
      {
        key: userMark.user_id.toString(),
        keyRecipients: [userMark],
        msgId: meAndMarkPm.id,
        unread: 1,
      },
      {
        key: [eg.selfUser.user_id, userJohn.user_id, userMark.user_id]
          .sort((a, b) => a - b)
          .map(String)
          .join(','),
        keyRecipients: [userJohn, userMark].sort((a, b) => a.user_id - b.user_id),
        msgId: meJohnAndMarkPm.id,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });

  test('returns recipients sorted by last activity', () => {
    // Maybe we can share these definitions with the above test;
    // first, we have to sort out why the IDs are different.
    const meAndMarkPm1 = eg.pmMessage({ id: 1, recipients: [eg.selfUser, userMark] });
    const meAndJohnPm1 = eg.pmMessage({ id: 2, recipients: [eg.selfUser, userJohn] });
    const meAndMarkPm2 = eg.pmMessage({ id: 3, recipients: [eg.selfUser, userMark] });
    const meAndJohnPm2 = eg.pmMessage({ id: 4, recipients: [eg.selfUser, userJohn] });
    const meJohnAndMarkPm = eg.pmMessage({ id: 5, recipients: [eg.selfUser, userJohn, userMark] });
    const meOnlyPm = eg.pmMessage({ id: 6, recipients: [eg.selfUser] });

    const state = eg.reduxState({
      realm: eg.realmState({ email: eg.selfUser.email }),
      users: [eg.selfUser, userJohn, userMark],
      narrows: Immutable.Map({
        [ALL_PRIVATE_NARROW_STR]: [
          meAndMarkPm1.id,
          meAndJohnPm1.id,
          meAndMarkPm2.id,
          meAndJohnPm2.id,
          meJohnAndMarkPm.id,
          meOnlyPm.id,
        ],
      }),
      messages: {
        [meAndJohnPm1.id]: meAndJohnPm1,
        [meAndMarkPm1.id]: meAndMarkPm1,
        [meAndJohnPm2.id]: meAndJohnPm2,
        [meAndMarkPm2.id]: meAndMarkPm2,
        [meJohnAndMarkPm.id]: meJohnAndMarkPm,
        [meOnlyPm.id]: meOnlyPm,
      },
      unread: {
        ...eg.baseReduxState.unread,
        pms: [
          {
            sender_id: eg.selfUser.user_id,
            unread_message_ids: [meAndJohnPm2.id],
          },
          {
            sender_id: userJohn.user_id,
            unread_message_ids: [meAndMarkPm1.id, meAndMarkPm2.id],
          },
          {
            sender_id: userMark.user_id,
            unread_message_ids: [meAndJohnPm1.id],
          },
        ],
        huddles: [
          {
            user_ids_string: [eg.selfUser.user_id, userJohn.user_id, userMark.user_id]
              .sort((a, b) => a - b)
              .map(String)
              .join(','),
            unread_message_ids: [meJohnAndMarkPm.id],
          },
        ],
      },
    });

    const expectedResult = [
      {
        key: eg.selfUser.user_id.toString(),
        keyRecipients: [eg.selfUser],
        msgId: meOnlyPm.id,
        unread: 1,
      },
      {
        key: [eg.selfUser.user_id, userJohn.user_id, userMark.user_id]
          .sort((a, b) => a - b)
          .map(String)
          .join(','),
        keyRecipients: [userJohn, userMark].sort((a, b) => a.user_id - b.user_id),
        msgId: meJohnAndMarkPm.id,
        unread: 1,
      },
      {
        key: userJohn.user_id.toString(),
        keyRecipients: [userJohn],
        msgId: meAndJohnPm2.id,
        unread: 2,
      },
      {
        key: userMark.user_id.toString(),
        keyRecipients: [userMark],
        msgId: meAndMarkPm2.id,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });
});
