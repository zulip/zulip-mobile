/* @flow strict-local */
import type { Narrow, User, LocalizableText } from '../types';
import { isStreamNarrow, isTopicNarrow, isPrivateNarrow, isGroupNarrow } from '../utils/narrow';

export default (
  narrow: Narrow,
  ownEmail: string,
  usersByEmail: Map<string, User>,
): LocalizableText => {
  if (isGroupNarrow(narrow)) {
    return { text: 'Message group' };
  }

  if (isPrivateNarrow(narrow)) {
    if (ownEmail && narrow[0].operand === ownEmail) {
      return { text: 'Jot down something' };
    }

    if (!usersByEmail) {
      return { text: 'Type a message' };
    }

    const user = usersByEmail.get(narrow[0].operand) || {};
    return {
      text: 'Message {recipient}',
      values: { recipient: `@${user.full_name}` },
    };
  }

  if (isStreamNarrow(narrow)) {
    return {
      text: 'Message {recipient}',
      values: { recipient: `#${narrow[0].operand}` },
    };
  }

  if (isTopicNarrow(narrow)) {
    return { text: 'Reply' };
  }

  return { text: 'Type a message' };
};
