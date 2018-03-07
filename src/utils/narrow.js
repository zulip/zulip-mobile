/* @flow */
import isEqual from 'lodash.isequal';
import escape from 'lodash.escape';
import unescape from 'lodash.unescape';

import type { Narrow, Message, Stream, User } from '../types';
import { normalizeRecipients } from './message';

export const homeNarrow: Narrow = [];

export const homeNarrowStr: string = '[]';

export const isHomeNarrow = (narrow: Narrow): boolean => (narrow ? narrow.length === 0 : false);

export const privateNarrow = (email: string): Narrow => [
  {
    operator: 'pm-with',
    operand: email,
  },
];

export const isPrivateNarrow = (narrow: Narrow): boolean =>
  narrow
    ? narrow.length === 1 &&
      narrow[0].operator === 'pm-with' &&
      narrow[0].operand.indexOf(',') === -1
    : false;

export const groupNarrow = (emails: string[]): Narrow => [
  {
    operator: 'pm-with',
    operand: emails.join(),
  },
];

export const isGroupNarrow = (narrow: Narrow): boolean =>
  narrow
    ? narrow.length === 1 && narrow[0].operator === 'pm-with' && narrow[0].operand.indexOf(',') >= 0
    : false;

export const isPrivateOrGroupNarrow = (narrow: Narrow): boolean =>
  narrow ? narrow.length === 1 && narrow[0].operator === 'pm-with' : false;

export const specialNarrow = (operand: string): Narrow => [
  {
    operator: 'is',
    operand,
  },
];

export const isSpecialNarrow = (narrow: Narrow): boolean =>
  narrow ? narrow.length === 1 && narrow[0].operator === 'is' : false;

export const allPrivateNarrow = specialNarrow('private');

export const allPrivateNarrowStr = JSON.stringify(allPrivateNarrow);

export const isAllPrivateNarrow = (narrow: Narrow): boolean =>
  narrow
    ? narrow.length === 1 && narrow[0].operator === 'is' && narrow[0].operand === 'private'
    : false;

export const streamNarrow = (stream: string): Narrow => [
  {
    operator: 'stream',
    operand: stream,
  },
];

export const isStreamNarrow = (narrow: Narrow): boolean =>
  narrow ? narrow.length === 1 && narrow[0].operator === 'stream' : false;

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
  narrow ? narrow.length === 2 && narrow[1].operator === 'topic' : false;

export const isStreamOrTopicNarrow = (narrow: Narrow): boolean =>
  narrow ? narrow.length >= 1 && narrow[0].operator === 'stream' : false;

export const searchNarrow = (query: string): Narrow => [
  {
    operator: 'search',
    operand: query,
  },
];

export const isSearchNarrow = (narrow: Narrow): boolean =>
  narrow ? narrow.length === 1 && narrow[0].operator === 'search' : false;

export const isMessageInNarrow = (message: Message, narrow: Narrow, ownEmail: string): boolean => {
  if (isHomeNarrow(narrow)) {
    return true;
  }

  if (isStreamNarrow(narrow) && message.display_recipient === narrow[0].operand) {
    return true;
  }

  if (
    isTopicNarrow(narrow) &&
    message.display_recipient === narrow[0].operand &&
    message.subject === narrow[1].operand
  ) {
    return true;
  }

  if (isPrivateOrGroupNarrow(narrow)) {
    const normalizedRecipients = normalizeRecipients(message.display_recipient);
    const normalizedNarrow = [...narrow[0].operand.split(','), ownEmail].sort().join(',');

    return normalizedRecipients === ownEmail || normalizedRecipients === normalizedNarrow;
  }

  if (isSpecialNarrow(narrow) && narrow[0].operand === message.type) {
    return true;
  }

  return false;
};

export const canSendToNarrow = (narrow: Narrow): boolean =>
  isPrivateNarrow(narrow) ||
  isGroupNarrow(narrow) ||
  isStreamNarrow(narrow) ||
  isTopicNarrow(narrow);

export const getNarrowFromMessage = (message: Message, email: string) => {
  if (Array.isArray(message.display_recipient)) {
    const recipient =
      message.display_recipient.length > 1
        ? message.display_recipient.filter(x => x.email !== email)
        : message.display_recipient;
    return groupNarrow(recipient.map(x => x.email));
  }

  if (message.subject && message.subject.length) {
    return topicNarrow(message.display_recipient, message.subject);
  }

  return streamNarrow(message.display_recipient);
};

export const validateNarrow = (narrow: Narrow, streams: Stream[], users: User[]): boolean => {
  if (isStreamOrTopicNarrow(narrow)) {
    // check if stream is not outdated
    return streams && streams.find(s => s.name === narrow[0].operand) !== undefined;
  }

  if (isPrivateNarrow(narrow)) {
    // check user account is not deactivited
    return users && users.find(u => u.email === narrow[0].operand) !== undefined;
  }

  return true;
};

export const isSameNarrow = (narrow1: Narrow, narrow2: Narrow): boolean =>
  !narrow1 || !narrow2 ? false : isEqual(narrow1, narrow2);

export const stringifyNarrow = (narrow: Narrow): string => escape(JSON.stringify(narrow));

export const parseNarrowString = (narrowStr: string): Narrow => JSON.parse(unescape(narrowStr));
