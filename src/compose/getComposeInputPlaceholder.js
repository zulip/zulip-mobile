/* @flow strict-local */
import type { Narrow, Stream, UserId, UserOrBot, LocalizableText, GetText } from '../types';
import { getFullNameText } from '../users/userSelectors';
import { caseNarrowDefault } from '../utils/narrow';

export default (
  narrow: Narrow,
  ownUserId: UserId,
  allUsersById: Map<UserId, UserOrBot>,
  streamsById: Map<number, Stream>,
  enableGuestUserIndicator: boolean,
  _: GetText,
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

        const user = allUsersById.get(userId);
        if (!user) {
          return { text: 'Type a message' };
        }

        return {
          text: 'Message {recipient}',
          values: { recipient: _(getFullNameText({ user, enableGuestUserIndicator })) },
        };
      },
      stream: streamId => {
        const stream = streamsById.get(streamId);
        if (!stream) {
          return { text: 'Type a message' };
        }
        return { text: 'Message {recipient}', values: { recipient: `#${stream.name}` } };
      },
      topic: () => ({ text: 'Reply' }),
    },
    () => ({ text: 'Type a message' }),
  );
