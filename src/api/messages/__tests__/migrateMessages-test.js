import migrateMessages from '../migrateMessages';

describe('migrateMessages', () => {
  test('Replace user object with `user_id`', () => {
    const messages = [
      { reactions: [{ user: { id: 1, full_name: 'name', email: 'a@a.com' }, code: 'code' }] },
    ];
    const expectedOutput = [{ reactions: [{ user_id: 1, code: 'code' }] }];

    expect(migrateMessages(messages)).toEqual(expectedOutput);
  });

  test('Do nothing `user_id` is already present', () => {
    const messages = [{ reactions: [{ user_id: 1 }] }];
    const messagesWithNoReactions = [{ id: 1 }];
    const messagesWithNoReactions2 = [{ id: 1, reactions: [] }];

    expect(migrateMessages(messages)).toEqual(messages);
    expect(migrateMessages(messagesWithNoReactions)).toEqual(messagesWithNoReactions);
    expect(migrateMessages(messagesWithNoReactions2)).toEqual(messagesWithNoReactions2);
  });
});
