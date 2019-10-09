/* @flow strict-local */
import type { Message } from '../apiTypes';
import type { ApiMessage, ApiMessageReaction } from './getMessages';

export default (messages: ApiMessage[]): Message[] =>
  messages.map((message: ApiMessage) => {
    const { reactions, ...restMessage } = message;
    return {
      ...restMessage,
      reactions: reactions.map((reaction: ApiMessageReaction) => {
        const { user, ...restReaction } = reaction;
        return {
          ...restReaction,
          user_id: user.id,
        };
      }),
    };
  });
