/* @flow strict-local */
import {
  transformFetchedMessage,
  type FetchedMessage,
  type FetchedReaction,
} from '../rawModelTypes';
import { identityOfAuth } from '../../account/accountMisc';
import * as eg from '../../__tests__/lib/exampleData';
import type { Message } from '../modelTypes';
import { GravatarURL } from '../../utils/avatar';

describe('transformFetchedMessage', () => {
  const reactingUser = eg.makeUser();

  const serverReaction: FetchedReaction = {
    emoji_name: '+1',
    reaction_type: 'unicode_emoji',
    emoji_code: '1f44d',
    user: {
      email: reactingUser.email,
      full_name: reactingUser.full_name,
      id: reactingUser.user_id,
    },
  };

  const fetchedMessage: FetchedMessage = {
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
    const input: FetchedMessage = fetchedMessage;

    const expectedOutput: Message = {
      ...fetchedMessage,
      reactions: [
        {
          user_id: reactingUser.user_id,
          emoji_name: serverReaction.emoji_name,
          reaction_type: serverReaction.reaction_type,
          emoji_code: serverReaction.emoji_code,
        },
      ],
      avatar_url: GravatarURL.validateAndConstructInstance({ email: fetchedMessage.sender_email }),
      edit_history:
        // $FlowIgnore[incompatible-cast] - See MessageEdit type
        (fetchedMessage.edit_history: Message['edit_history']),
    };

    const actualOutput: Message = transformFetchedMessage<Message>(
      input,
      identityOfAuth(eg.selfAuth),
      eg.recentZulipFeatureLevel,
      true,
    );

    test('In reactions, replace user object with `user_id`', () => {
      expect(actualOutput.reactions).toEqual(expectedOutput.reactions);
    });

    test('Converts avatar_url correctly', () => {
      expect(actualOutput.avatar_url).toEqual(expectedOutput.avatar_url);
    });

    test('Keeps edit_history, if allowEditHistory is true', () => {
      expect(actualOutput.edit_history).toEqual(expectedOutput.edit_history);
    });

    test('Drops edit_history, if allowEditHistory is false', () => {
      expect(
        transformFetchedMessage<Message>(
          input,
          identityOfAuth(eg.selfAuth),
          eg.recentZulipFeatureLevel,
          false,
        ).edit_history,
      ).toEqual(null);
    });
  });

  describe('drops edit_history from pre-118 server', () => {
    expect(
      transformFetchedMessage<Message>(
        {
          ...fetchedMessage,
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
        identityOfAuth(eg.selfAuth),
        117,
        true,
      ).edit_history,
    ).toEqual(null);
  });
});
