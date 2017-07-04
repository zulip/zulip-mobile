/* @flow */
import type { Narrow, UserType, LocalizableText } from '../types';
import { isStreamNarrow, isTopicNarrow, isPrivateNarrow, isGroupNarrow } from '../utils/narrow';

export default (narrow: Narrow, ownEmail: string, users: UserType[]): LocalizableText => {
  if (isGroupNarrow(narrow)) {
    return { text: 'Message group' };
  }

  if (isPrivateNarrow(narrow)) {
    if (ownEmail && narrow[0].operand === ownEmail) {
      return { text: 'Jot down something' };
    }

    if (!users) {
      return { text: 'Type a message' };
    }

    const user = users.find(u => u.email === narrow[0].operand) || {};
    return {
      text: 'Message {recipient}',
      values: { recipient: `@${user.fullName}` }
    };
  }

  if (isStreamNarrow(narrow)) {
    return {
      text: 'Message {recipient}',
      values: { recipient: `#${narrow[0].operand}` }
    };
  }

  if (isTopicNarrow(narrow)) {
    return {
      text: 'Message {recipient}',
      values: { recipient: `#${narrow[0].operand}:${narrow[1].operand}` }
    };
  }

  return { text: 'Type a message' };
};
