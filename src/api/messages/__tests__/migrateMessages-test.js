import { migrateMessages } from '../getMessages';

describe('migrateMessages', () => {
  test('Replace user object with `user_id`', () => {
    const messages = [
      { reactions: [{ user: { id: 1, full_name: 'name', email: 'a@a.com' }, code: 'code' }] },
    ];
    const expectedOutput = [{ reactions: [{ user_id: 1, code: 'code' }] }];

    expect(migrateMessages(messages)).toEqual(expectedOutput);
  });
});
