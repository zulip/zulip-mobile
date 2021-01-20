/* @flow strict-local */
import type { Narrow, UserId, UserOrBot, LocalizableText } from '../types';
import { caseNarrowDefault } from '../utils/narrow';

export default (
  narrow: Narrow,
  ownUserId: UserId,
  usersById: Map<number, UserOrBot>,
): LocalizableText =>
  caseNarrowDefault(
    narrow,
    {
      pm: ids => {
        if (ids.length > 1) {
          return { text: 'Message group' };
        }
        const userId = ids[0];

        if (userId === ownUserId) {
          return { text: 'Jot down something' };
        }

        const user = usersById.get(userId);
        if (!user) {
          return { text: 'Type a message' };
        }

        return {
          text: 'Message {recipient}',
          values: { recipient: `@${user.full_name}` },
        };
      },
      stream: name => ({
        text: 'Message {recipient}',
        values: { recipient: `#${name}` },
      }),
      topic: () => ({ text: 'Reply' }),
    },
    () => ({ text: 'Type a message' }),
  );
