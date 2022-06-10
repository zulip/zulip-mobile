/* @flow strict-local */
import { migrateMessages } from '../getMessages';
import { identityOfAuth } from '../../../account/accountMisc';
import * as eg from '../../../__tests__/lib/exampleData';
import type { ServerMessage, ServerReaction } from '../getMessages';
import type { Message } from '../../modelTypes';
import { GravatarURL } from '../../../utils/avatar';

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
  avatar_url: null,
  edit_history: [
    {
      prev_content: 'foo',
      prev_rendered_content: '<p>foo</p>',
      prev_stream: eg.stream.stream_id,
      prev_topic: 'bar',
      stream: eg.otherStream.stream_id,
      timestamp: 0,
      topic: 'bar!',
      user_id: eg.selfUser.user_id,
    },
  ],
};

describe('recent server', () => {
  const input: $ReadOnlyArray<ServerMessage> = [serverMessage];

  const expectedOutput: $ReadOnlyArray<Message> = [
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
      avatar_url: GravatarURL.validateAndConstructInstance({ email: serverMessage.sender_email }),
      edit_history:
        // $FlowIgnore[incompatible-cast] - See MessageEdit type
        (serverMessage.edit_history: Message['edit_history']),
    },
  ];

  const actualOutput: $ReadOnlyArray<Message> = migrateMessages(
    input,
    identityOfAuth(eg.selfAuth),
    eg.recentZulipFeatureLevel,
  );

  test('In reactions, replace user object with `user_id`', () => {
    expect(actualOutput.map(m => m.reactions)).toEqual(expectedOutput.map(m => m.reactions));
  });

  test('Converts avatar_url correctly', () => {
    expect(actualOutput.map(m => m.avatar_url)).toEqual(expectedOutput.map(m => m.avatar_url));
  });

  test('Keeps edit_history', () => {
    expect(actualOutput.map(m => m.edit_history)).toEqual(expectedOutput.map(m => m.edit_history));
  });
});

describe('drops edit_history from pre-118 server', () => {
  expect(
    migrateMessages(
      [
        {
          ...serverMessage,
          edit_history: [
            {
              prev_content: 'foo',
              prev_rendered_content: '<p>foo</p>',
              prev_stream: eg.stream.stream_id,
              prev_subject: 'bar',
              timestamp: 0,
              user_id: eg.selfUser.user_id,
            },
          ],
        },
      ],
      identityOfAuth(eg.selfAuth),
      117,
    ).map(m => m.edit_history),
  ).toEqual([null]);
});
