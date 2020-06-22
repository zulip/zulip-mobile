/* @flow strict-local */
import omit from 'lodash.omit';

import { migrateMessages } from '../getMessages';
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
    // The `omit` shouldn't be necessary with Flow v0.111: "Spreads
    // now overwrite properties instead of inferring unions"
    // (https://medium.com/flow-type/spreads-common-errors-fixes-9701012e9d58).
    ...(omit(eg.streamMessage(), 'reactions'): $Diff<Message, { reactions: mixed }>),
    reactions: [serverReaction],
  };

  const input: ServerMessage[] = [serverMessage];

  const expectedOutput: Message[] = [
    {
      // The `omit` shouldn't be necessary with Flow v0.111.
      ...(omit(serverMessage, 'reactions'): $Diff<ServerMessage, { reactions: mixed }>),
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

  const actualOutput: Message[] = migrateMessages(input);

  test('Replace user object with `user_id`', () => {
    expect(actualOutput.map(m => m.reactions)).toEqual(expectedOutput.map(m => m.reactions));
  });
});
