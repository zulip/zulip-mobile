/* @flow */
import isEqual from 'lodash.isequal';
import unescape from 'lodash.unescape';

import type { Narrow, Message } from '../types';
import { normalizeRecipients } from './message';

export const HOME_NARROW: Narrow = [];

export const HOME_NARROW_STR: string = '[]';

export const isHomeNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 0;

export const privateNarrow = (email: string): Narrow => [
  {
    operator: 'pm-with',
    operand: email,
  },
];

export const isPrivateNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow)
  && narrow.length === 1
  && narrow[0].operator === 'pm-with'
  && narrow[0].operand.indexOf(',') === -1;

export const groupNarrow = (emails: string[]): Narrow => [
  {
    operator: 'pm-with',
    operand: emails.join(),
  },
];

export const isGroupNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow)
  && narrow.length === 1
  && narrow[0].operator === 'pm-with'
  && narrow[0].operand.indexOf(',') >= 0;

export const isPrivateOrGroupNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 1 && narrow[0].operator === 'pm-with';

export const specialNarrow = (operand: string): Narrow => [
  {
    operator: 'is',
    operand,
  },
];

export const isSpecialNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 1 && narrow[0].operator === 'is';

export const ALL_PRIVATE_NARROW = specialNarrow('private');

export const ALL_PRIVATE_NARROW_STR = JSON.stringify(ALL_PRIVATE_NARROW);

export const isAllPrivateNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow)
  && narrow.length === 1
  && narrow[0].operator === 'is'
  && narrow[0].operand === 'private';

export const streamNarrow = (stream: string): Narrow => [
  {
    operator: 'stream',
    operand: stream,
  },
];

export const isStreamNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 1 && narrow[0].operator === 'stream';

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
  Array.isArray(narrow) && narrow.length === 2 && narrow[1].operator === 'topic';

export const isStreamOrTopicNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length >= 1 && narrow[0].operator === 'stream';

export const SEARCH_NARROW = (query: string): Narrow => [
  {
    operator: 'search',
    operand: query,
  },
];

export const isSearchNarrow = (narrow: Narrow): boolean =>
  Array.isArray(narrow) && narrow.length === 1 && narrow[0].operator === 'search';

export const isMessageInNarrow = (message: Message, narrow: Narrow, ownEmail: string): boolean => {
  if (isHomeNarrow(narrow)) {
    return true;
  }

  if (isStreamNarrow(narrow) && message.display_recipient === narrow[0].operand) {
    return true;
  }

  if (
    isTopicNarrow(narrow)
    && message.display_recipient === narrow[0].operand
    && message.subject === narrow[1].operand
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
  isPrivateNarrow(narrow)
  || isGroupNarrow(narrow)
  || isStreamNarrow(narrow)
  || isTopicNarrow(narrow);

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

export const isSameNarrow = (narrow1: Narrow, narrow2: Narrow): boolean =>
  Array.isArray(narrow1) && Array.isArray(narrow2) && isEqual(narrow1, narrow2);

export const parseNarrowString = (narrowStr: string): Narrow => JSON.parse(unescape(narrowStr));

export const STARRED_NARROW = specialNarrow('starred');
