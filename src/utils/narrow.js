/* @flow strict-local */
import isEqual from 'lodash.isequal';
import unescape from 'lodash.unescape';

import type { Narrow, Message, Outbox, User, UserOrBot } from '../types';
import {
  normalizeRecipientsSansMe,
  pmKeyRecipientsFromMessage,
  recipientsOfPrivateMessage,
  streamNameOfStreamMessage,
  type PmKeyRecipients,
  type PmKeyUsers,
} from './recipient';

export const isSameNarrow = (narrow1: Narrow, narrow2: Narrow): boolean =>
  Array.isArray(narrow1) && Array.isArray(narrow2) && isEqual(narrow1, narrow2);

export const parseNarrowString = (narrowStr: string): Narrow => JSON.parse(unescape(narrowStr));

/**
 * The key we use for this narrow in our Redux data structures.
 *
 * See in particular `NarrowsState`, `CaughtUpState`, `FetchingState`,
 * and `DraftsState`.
 */
export const keyFromNarrow = (narrow: Narrow): string => JSON.stringify(narrow);

export const HOME_NARROW: Narrow = [];

export const HOME_NARROW_STR: string = keyFromNarrow(HOME_NARROW);

/**
 * A PM narrow, either 1:1 or group.
 *
 * Private to this module because the input format is kind of odd.
 * Use `pmNarrowFromEmail` or `pmNarrowFromEmails` instead.
 *
 * For the quirks of the underlying format in the Zulip API, see:
 *   https://zulipchat.com/api/construct-narrow
 *   https://github.com/zulip/zulip/issues/13167
 */
const pmNarrowByString = (emails: string): Narrow => [
  {
    operator: 'pm-with',
    operand: emails,
  },
];

/**
 * A PM narrow, either 1:1 or group.
 *
 * The list of users represented in `emails` must agree with what
 * `pmKeyRecipientsFromMessage` would return.  Effectively this means:
 *  * it actually comes from `pmKeyRecipientsFromMessage`, or one of its
 *    relatives in `src/utils/recipient.js`;
 *  * or it's a singleton list, which those would always be a no-op on.
 *
 * We enforce this by keeping this constructor private to this module, and
 * only calling it from higher-level constructors whose input types enforce
 * one of these conditions or the other.  (Well, and one more which is only
 * to be used in test code.)
 *
 * In the past, before this was checked and before it was done consistently,
 * we had quite a lot of bugs due to different parts of our code
 * accidentally disagreeing on whether to include the self-user, or on how
 * to sort the list (by user ID vs. email), or neglecting to sort it at all.
 */
const pmNarrowFromEmails = (emails: string[]): Narrow => pmNarrowByString(emails.join());

/**
 * DEPRECATED.  Use `pm1to1NarrowFromUser` instead.
 *
 * This function is being replaced by `pm1to1NarrowFromUser`, as part of
 * migrating from emails to user IDs to identify users.  Don't add new uses
 * of this function; use that one instead.
 */
export const pmNarrowFromEmail = (email: string): Narrow => pmNarrowFromEmails([email]);

/**
 * A PM narrow, either 1:1 or group.
 *
 * The argument's type guarantees that it comes from
 * `pmKeyRecipientsFromMessage` or one of its related functions.  This
 * ensures that we've properly either removed the self user, or not.
 *
 * See also `pmNarrowFromUsers`, which does the same thing with a slightly
 * different form of input.
 */
export const pmNarrowFromRecipients = (recipients: PmKeyRecipients): Narrow =>
  pmNarrowFromEmails(recipients.map(r => r.email));

/**
 * A PM narrow, either 1:1 or group.
 *
 * This is just like `pmNarrowFromRecipients`, but taking a slightly
 * different form of input.  Use whichever one is more convenient.
 *
 * See also `pm1to1NarrowFromUser`, which is more convenient when you have a
 * single specific user.
 */
export const pmNarrowFromUsers = (recipients: PmKeyUsers): Narrow =>
  pmNarrowFromEmails(recipients.map(r => r.email));

/**
 * FOR TESTS ONLY.  Like pmNarrowFromUsers, but without validation.
 *
 * This exists purely for convenience in tests. Unlike the other Narrow
 * constructors, its type does not require the argument to have come from a
 * function that applies our "maybe filter out self" convention.  The caller
 * is still required to do so, but nothing checks this.
 *
 * Outside of tests, always use pmNarrowFromUsers instead.  Use
 * pmKeyRecipientsFromUsers, along with an ownUserId value, to produce the
 * needed input.
 *
 * This does take care of sorting the input as needed.
 */
// It'd be fine for test data to go through the usual filtering logic; the
// annoying thing is just that that requires an ownUserId value.
export const pmNarrowFromUsersUnsafe = (recipients: UserOrBot[]): Narrow =>
  pmNarrowFromEmails(recipients.sort((a, b) => a.user_id - b.user_id).map(r => r.email));

/**
 * A 1:1 PM narrow, possibly with self.
 *
 * This has the same effect as calling pmNarrowFromUsers, but for code that
 * statically has just one other user it's a bit more convenient because it
 * doesn't require going through our `recipient` helpers.
 */
export const pm1to1NarrowFromUser = (user: UserOrBot): Narrow => pmNarrowFromEmails([user.email]);

export const specialNarrow = (operand: string): Narrow => [
  {
    operator: 'is',
    operand,
  },
];

export const STARRED_NARROW = specialNarrow('starred');

export const STARRED_NARROW_STR = keyFromNarrow(STARRED_NARROW);

export const MENTIONED_NARROW = specialNarrow('mentioned');

export const MENTIONED_NARROW_STR = keyFromNarrow(MENTIONED_NARROW);

export const ALL_PRIVATE_NARROW = specialNarrow('private');

export const ALL_PRIVATE_NARROW_STR = keyFromNarrow(ALL_PRIVATE_NARROW);

export const streamNarrow = (stream: string): Narrow => [
  {
    operator: 'stream',
    operand: stream,
  },
];

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

export const SEARCH_NARROW = (query: string): Narrow => [
  {
    operator: 'search',
    operand: query,
  },
];

type NarrowCases<T> = {|
  home: () => T,
  pm: (emails: string[]) => T,
  starred: () => T,
  mentioned: () => T,
  allPrivate: () => T,
  stream: (name: string) => T,
  topic: (streamName: string, topic: string) => T,
  search: (query: string) => T,
|};

/* prettier-ignore */
export function caseNarrow<T>(narrow: Narrow, cases: NarrowCases<T>): T {
  const err = (): empty => {
    throw new Error(`bad narrow: ${keyFromNarrow(narrow)}`);
  };

  switch (narrow.length) {
    case 0: return cases.home();
    case 1:
      switch (narrow[0].operator) {
        case 'pm-with': {
            const emails = narrow[0].operand.split(',');
            return cases.pm(emails);
          }
        case 'is':
          switch (narrow[0].operand) {
            case 'starred': return cases.starred();
            case 'mentioned': return cases.mentioned();
            case 'private': return cases.allPrivate();
            default: return err();
          }
        case 'stream': return cases.stream(narrow[0].operand);
        case 'search': return cases.search(narrow[0].operand);
        default: return err();
      }
    case 2: return cases.topic(narrow[0].operand, narrow[1].operand);
    default: return err();
  }
}

export function caseNarrowPartial<T>(narrow: Narrow, cases: $Shape<NarrowCases<T>>): T {
  const err = (type: string) => (): empty => {
    throw new Error(`unexpected ${type} narrow: ${keyFromNarrow(narrow)}`);
  };
  return caseNarrow(
    narrow,
    Object.assign(
      ({
        home: err('home'),
        pm: err('PM'),
        starred: err('starred'),
        mentioned: err('mentions'),
        allPrivate: err('all-private'),
        stream: err('stream'),
        topic: err('topic'),
        search: err('search'),
      }: NarrowCases<T>),
      cases,
    ),
  );
}

export function caseNarrowDefault<T>(
  narrow: Narrow,
  cases: $Shape<NarrowCases<T>>,
  defaultCase: () => T,
): T {
  return caseNarrow(
    narrow,
    Object.assign(
      ({
        home: defaultCase,
        pm: defaultCase,
        starred: defaultCase,
        mentioned: defaultCase,
        allPrivate: defaultCase,
        stream: defaultCase,
        topic: defaultCase,
        search: defaultCase,
      }: NarrowCases<T>),
      cases,
    ),
  );
}

export const isHomeNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { home: () => true }, () => false);

export const is1to1PmNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { pm: emails => emails.length === 1 }, () => false);

export const isGroupPmNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { pm: emails => emails.length > 1 }, () => false);

/**
 * The recipients' emails if a group PM narrow; else error.
 *
 * Any use of this probably means something higher up should be refactored
 * to use caseNarrow.
 */
export const emailsOfGroupPmNarrow = (narrow: Narrow): string[] =>
  caseNarrowPartial(narrow, {
    pm: emails => {
      if (emails.length === 1) {
        throw new Error('emailsOfGroupPmNarrow: got 1:1 narrow');
      }
      return emails;
    },
  });

export const isPmNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { pm: () => true }, () => false);

export const isSpecialNarrow = (narrow?: Narrow): boolean =>
  !!narrow
  && caseNarrowDefault(
    narrow,
    { starred: () => true, mentioned: () => true, allPrivate: () => true },
    () => false,
  );

export const isAllPrivateNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { allPrivate: () => true }, () => false);

export const isStreamNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { stream: () => true }, () => false);

export const isTopicNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { topic: () => true }, () => false);

export const isStreamOrTopicNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { stream: () => true, topic: () => true }, () => false);

export const isSearchNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { search: () => true }, () => false);

/**
 * True just if the given message is part of the given narrow.
 *
 * This function does not support search narrows, and for them always
 * returns false.
 *
 * The message's flags must be in `flags`; `message.flags` is ignored.  This
 * makes it the caller's responsibility to deal with the ambiguity in our
 * Message type of whether the message's flags live in a `flags` property or
 * somewhere else.
 *
 * See also getNarrowsForMessage, which should list exactly the narrows this
 * would return true for.
 */
export const isMessageInNarrow = (
  message: Message | Outbox,
  flags: $ReadOnlyArray<string>,
  narrow: Narrow,
  ownEmail: string,
): boolean =>
  caseNarrow(narrow, {
    home: () => true,
    stream: name => message.type === 'stream' && name === streamNameOfStreamMessage(message),
    topic: (streamName, topic) =>
      message.type === 'stream'
      && streamName === streamNameOfStreamMessage(message)
      && topic === message.subject,
    pm: emails => {
      if (message.type !== 'private') {
        return false;
      }
      const recipients = recipientsOfPrivateMessage(message);
      const narrowAsRecipients = emails.map(email => ({ email }));
      return (
        normalizeRecipientsSansMe(recipients, ownEmail)
        === normalizeRecipientsSansMe(narrowAsRecipients, ownEmail)
      );
    },
    starred: () => flags.includes('starred'),
    mentioned: () => flags.includes('mentioned') || flags.includes('wildcard_mentioned'),
    allPrivate: () => message.type === 'private',
    search: () => false,
    // Adding a case here?  Be sure to add to getNarrowsForMessage, too.
  });

export const canSendToNarrow = (narrow: Narrow): boolean =>
  caseNarrow(narrow, {
    pm: () => true,
    stream: () => true,
    topic: () => true,
    home: () => false,
    starred: () => false,
    mentioned: () => false,
    allPrivate: () => false,
    search: () => false,
  });

/**
 * Answers the question, "What narrows does this message appear in?"
 *
 * This function does not support search narrows, and it always
 * excludes them.
 *
 * The message's flags must be in `flags`; `message.flags` is ignored.  This
 * makes it the caller's responsibility to deal with the ambiguity in our
 * Message type of whether the message's flags live in a `flags` property or
 * somewhere else.
 *
 * See also isMessageInNarrow, which should return true for exactly the
 * narrows this lists and no others.
 */
export const getNarrowsForMessage = (
  message: Message | Outbox,
  ownUser: User,
  flags: $ReadOnlyArray<string>,
): Narrow[] => {
  const result = [];

  // All messages are in the home narrow.
  result.push(HOME_NARROW);

  if (message.type === 'private') {
    result.push(ALL_PRIVATE_NARROW);
    result.push(pmNarrowFromRecipients(pmKeyRecipientsFromMessage(message, ownUser)));
  } else {
    const streamName = streamNameOfStreamMessage(message);
    result.push(topicNarrow(streamName, message.subject));
    result.push(streamNarrow(streamName));
  }

  if (flags.includes('mentioned') || flags.includes('wildcard_mentioned')) {
    result.push(MENTIONED_NARROW);
  }

  if (flags.includes('starred')) {
    result.push(STARRED_NARROW);
  }

  // SEARCH_NARROW we always leave out

  return result;
};

/**
 * Answers the question, "Where should my reply to a message go?"
 *
 * For stream messages, chooses a topic narrow over a stream narrow.
 */
// TODO: probably make this a private local helper of its one caller,
//   now that it's free of fiddly details from the Narrow data structure
export const getNarrowForReply = (message: Message | Outbox, ownUser: User) => {
  if (message.type === 'private') {
    return pmNarrowFromRecipients(pmKeyRecipientsFromMessage(message, ownUser));
  } else {
    const streamName = streamNameOfStreamMessage(message);
    return topicNarrow(streamName, message.subject);
  }
};
