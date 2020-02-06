/* @flow strict-local */
import type { Narrow, UserOrBot, LocalizableText } from '../types';
import { caseNarrowDefault } from '../utils/narrow';

export default (
  narrow: Narrow,
  ownEmail: string,
  usersByEmail: Map<string, UserOrBot>,
): LocalizableText =>
  caseNarrowDefault(
    narrow,
    {
      pm: emails => {
        if (emails.length > 1) {
          return { text: 'Message group' };
        }
        const email = emails[0];

        if (ownEmail && email === ownEmail) {
          return { text: 'Jot down something' };
        }

        if (!usersByEmail) {
          return { text: 'Type a message' };
        }
        const user = usersByEmail.get(email) || {};

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
