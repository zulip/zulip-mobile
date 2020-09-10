/* @flow strict-local */
import { migrateMessages } from '../getMessages';
import { identityOfAuth } from '../../../account/accountMisc';
import * as eg from '../../../__tests__/lib/exampleData';
import type { ServerMessage, ServerReaction } from '../getMessages';
import type { Message } from '../../modelTypes';

describe('migrateMessages', () => {
  const reactingUser = eg.makeUser();

  const serverReaction: ServerReaction = {
    emoji_name: '+1',
    reaction_type: 'unicode_emoji',
    emoji_code: '1f44d',
    user: {
      email: reactingUser.email,
      full_name: reactingUser.full_name,
      id: reactingUser.user_id,
    },
  };

  const serverMessage: ServerMessage = {
    ...eg.streamMessage(),
    reactions: [serverReaction],
  };

  const input: ServerMessage[] = [serverMessage];

  const expectedOutput: Message[] = [
    {
      ...serverMessage,
      reactions: [
        {
          user_id: reactingUser.user_id,
          emoji_name: serverReaction.emoji_name,
          reaction_type: serverReaction.reaction_type,
          emoji_code: serverReaction.emoji_code,
        },
      ],
    },
  ];

  const actualOutput: Message[] = migrateMessages(input, identityOfAuth(eg.selfAuth));

  test('Replace user object with `user_id`', () => {
    expect(actualOutput.map(m => m.reactions)).toEqual(expectedOutput.map(m => m.reactions));
  });
});
