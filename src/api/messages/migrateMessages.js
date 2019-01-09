/* @flow strict-local */
import type { Message } from '../apiTypes';
import type { ApiMessage, ApiMessageReaction } from './getMessages';

export default (messages: ApiMessage[]): Message[] =>
  messages.map((message: ApiMessage) => {
    // $FlowFixMe Do nothing if already migrated
    if (!message.reactions || message.reactions.length === 0 || message.reactions[0].user_id) {
      // $FlowFixMe
      return message;
    }

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
