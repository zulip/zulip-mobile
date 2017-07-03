/* @flow */
import { Narrow, Message } from '../types';
import { normalizeRecipients } from './message';

export const homeNarrow = (): Narrow => [];

export const isHomeNarrow = (narrow: Narrow): boolean =>
  narrow.length === 0;

export const privateNarrow = (email: string): Narrow => [{
  operator: 'pm-with',
  operand: email,
}];

export const isPrivateNarrow = (narrow: Narrow): boolean =>
  narrow.length === 1 &&
  narrow[0].operator === 'pm-with' &&
  narrow[0].operand.indexOf(',') === -1;

export const groupNarrow = (emails: string[]): Narrow => [{
  operator: 'pm-with',
  operand: emails.join(),
}];

export const isGroupNarrow = (narrow: Narrow): boolean =>
  narrow.length === 1 &&
  narrow[0].operator === 'pm-with' &&
  narrow[0].operand.indexOf(',') >= 0;

export const isPrivateOrGroupNarrow = (narrow: Narrow): boolean =>
  narrow.length === 1 &&
  narrow[0].operator === 'pm-with';

export const specialNarrow = (operand: string): Narrow => [{
  operator: 'is',
  operand,
}];

export const isSpecialNarrow = (narrow: Narrow): boolean =>
  narrow.length === 1 &&
  narrow[0].operator === 'is';

export const streamNarrow = (stream: string): Narrow => [{
  operator: 'stream',
  operand: stream,
}];

export const isStreamNarrow = (narrow: Narrow): boolean =>
  narrow.length === 1 &&
  narrow[0].operator === 'stream';

export const topicNarrow = (stream: string, topic: string): Narrow => [
  {
    operator: 'stream',
    operand: stream,
  },
  {
    operator: 'topic',
    operand: topic,
  },
];

export const isTopicNarrow = (narrow: Narrow): boolean =>
  narrow.length === 2 &&
  narrow[1].operator === 'topic';

export const searchNarrow = (query: string): Narrow => [{
  operator: 'search',
  operand: query,
}];

export const isSearchNarrow = (narrow: Narrow): boolean =>
  narrow.length === 1 &&
  narrow[0].operator === 'search';

export const isMessageInNarrow = (message: Message, narrow: Narrow, selfEmail: string) => {
  if (isHomeNarrow(narrow)) {
    return true;
  }

  if (isStreamNarrow(narrow) &&
    message.display_recipient === narrow[0].operand
  ) {
    return true;
  }

  if (isTopicNarrow(narrow) &&
    message.display_recipient === narrow[0].operand &&
    message.subject === narrow[1].operand
  ) {
    return true;
  }


  if (isPrivateOrGroupNarrow(narrow)) {
    const normalizedRecipients = normalizeRecipients(message.display_recipient);
    const normalizedNarrow = [...narrow[0].operand.split(','), selfEmail].sort().join(',');

    return normalizedRecipients === selfEmail || normalizedRecipients === normalizedNarrow;
  }

  if (isSpecialNarrow(narrow) &&
    narrow[0].operand === message.type
  ) {
    return true;
  }

  return false;
};

export const canSendToNarrow = (narrow: Narrow) =>
  isPrivateNarrow(narrow) ||
  isGroupNarrow(narrow) ||
  isStreamNarrow(narrow) ||
  isTopicNarrow(narrow);

export const narrowFromMessage = (message: Message, email: string) => {
  if (Array.isArray(message.display_recipient)) {
    const recipient = message.display_recipient.filter(x => x.email !== email);
    return groupNarrow(recipient.map(x => x.email));
  }

  if (message.subject && message.subject.length) {
    return topicNarrow(message.display_recipient, message.subject);
  }

  return streamNarrow(message.display_recipient);
};
