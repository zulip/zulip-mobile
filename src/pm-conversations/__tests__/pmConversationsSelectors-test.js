/* @flow strict-local */
import { getRecentConversations } from '../pmConversationsSelectors';
import { ALL_PRIVATE_NARROW_STR } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('getRecentConversations', () => {
  const userJohn = { ...eg.makeUser({ name: 'John' }), user_id: 1 };
  const userMark = { ...eg.makeUser({ name: 'Mark' }), user_id: 2 };

  test('when no messages, return no conversations', () => {
    const state = eg.reduxState({
      realm: eg.realmState({ email: eg.selfUser.email }),
      users: [eg.selfUser],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [],
      },
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
    const meAndJohnPm1 = eg.pmMessage({
      id: 1,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userJohn),
      ],
    });

    const meAndMarkPm = eg.pmMessage({
      id: 2,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userMark),
      ],
    });

    const meAndJohnPm2 = eg.pmMessage({
      id: 3,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userJohn),
      ],
    });

    const meOnlyPm = eg.pmMessage({
      id: 4,
      display_recipient: [eg.displayRecipientFromUser(eg.selfUser)],
    });

    const meJohnAndMarkPm = eg.pmMessage({
      id: 0,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userMark),
        eg.displayRecipientFromUser(userJohn),
      ],
    });

    const state = eg.reduxState({
      realm: eg.realmState({ email: eg.selfUser.email }),
      users: [eg.selfUser, userJohn, userMark],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [
          meJohnAndMarkPm.id,
          meAndJohnPm1.id,
          meAndMarkPm.id,
          meAndJohnPm2.id,
          meOnlyPm.id,
        ],
      },
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
        ids: eg.selfUser.user_id.toString(),
        recipients: eg.selfUser.email,
        msgId: meOnlyPm.id,
        unread: 1,
      },
      {
        ids: userJohn.user_id.toString(),
        recipients: userJohn.email,
        msgId: meAndJohnPm2.id,
        unread: 2,
      },
      {
        ids: userMark.user_id.toString(),
        recipients: userMark.email,
        msgId: meAndMarkPm.id,
        unread: 1,
      },
      {
        ids: [eg.selfUser.user_id, userJohn.user_id, userMark.user_id]
          .sort((a, b) => a - b)
          .map(String)
          .join(','),
        recipients: [userJohn.email, userMark.email].sort().join(','),
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

    const meAndMarkPm1 = eg.pmMessage({
      id: 1,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userMark),
      ],
    });

    const meAndJohnPm1 = eg.pmMessage({
      id: 2,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userJohn),
      ],
    });

    const meAndMarkPm2 = eg.pmMessage({
      id: 3,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userMark),
      ],
    });

    const meAndJohnPm2 = eg.pmMessage({
      id: 4,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userJohn),
      ],
    });

    const meJohnAndMarkPm = eg.pmMessage({
      id: 5,
      display_recipient: [
        eg.displayRecipientFromUser(eg.selfUser),
        eg.displayRecipientFromUser(userJohn),
        eg.displayRecipientFromUser(userMark),
      ],
    });

    const meOnlyPm = eg.pmMessage({
      id: 6,
      display_recipient: [eg.displayRecipientFromUser(eg.selfUser)],
    });

    const state = eg.reduxState({
      realm: eg.realmState({ email: eg.selfUser.email }),
      users: [eg.selfUser, userJohn, userMark],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [
          meAndMarkPm1.id,
          meAndJohnPm1.id,
          meAndMarkPm2.id,
          meAndJohnPm2.id,
          meJohnAndMarkPm.id,
          meOnlyPm.id,
        ],
      },
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
        ids: eg.selfUser.user_id.toString(),
        recipients: eg.selfUser.email,
        msgId: meOnlyPm.id,
        unread: 1,
      },
      {
        ids: [eg.selfUser.user_id, userJohn.user_id, userMark.user_id]
          .sort((a, b) => a - b)
          .map(String)
          .join(','),
        recipients: [userJohn.email, userMark.email].sort().join(','),
        msgId: meJohnAndMarkPm.id,
        unread: 1,
      },
      {
        ids: userJohn.user_id.toString(),
        recipients: userJohn.email,
        msgId: meAndJohnPm2.id,
        unread: 2,
      },
      {
        ids: userMark.user_id.toString(),
        recipients: userMark.email,
        msgId: meAndMarkPm2.id,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });
});
