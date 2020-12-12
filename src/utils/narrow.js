/* @flow strict-local */
import invariant from 'invariant';

import type { ApiNarrow, Message, Outbox, User, UserOrBot } from '../types';
import {
  normalizeRecipientsAsUserIdsSansMe,
  pmKeyRecipientsFromMessage,
  recipientsOfPrivateMessage,
  streamNameOfStreamMessage,
  type PmKeyRecipients,
  type PmKeyUsers,
} from './recipient';

/* eslint-disable no-use-before-define */

/**
 * A narrow.
 *
 * A narrow is the navigational property that defines what to show in the
 * message list UI: it's a subset of messages which might be a conversation,
 * a whole stream, a search, or a few other varieties.
 *
 * Much of the data we fetch is to support the message list UI, and so we
 * keep much of it in data structures indexed by narrow.
 *
 * See also:
 *  * `keyFromNarrow`, for converting into a string key good for indexing
 *    into a data structure;
 *  * `caseNarrow` and its relatives, for pattern-matching or destructuring;
 *  * `ApiNarrow` for the form we put a narrow in when talking to the
 *    server, and `apiNarrowOfNarrow` for converting to it.
 */
export opaque type Narrow =
  | {| type: 'stream', streamName: string |}
  | {| type: 'topic', streamName: string, topic: string |}
  | {| type: 'pm', userIds: $ReadOnlyArray<number>, emails: $ReadOnlyArray<string> |}
  | {| type: 'search', query: string |}
  | {| type: 'all' | 'starred' | 'mentioned' | 'all-pm' |};

export const HOME_NARROW: Narrow = Object.freeze({ type: 'all' });

export const HOME_NARROW_STR: string = keyFromNarrow(HOME_NARROW);

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
const pmNarrowInternal = (userIds: $ReadOnlyArray<number>, emails: string[]): Narrow =>
  Object.freeze({ type: 'pm', userIds, emails });

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
  pmNarrowInternal(recipients.map(r => r.id), recipients.map(r => r.email));

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
  pmNarrowInternal(recipients.map(r => r.user_id), recipients.map(r => r.email));

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
export const pmNarrowFromUsersUnsafe = (recipients: UserOrBot[]): Narrow => {
  recipients.sort((a, b) => a.user_id - b.user_id);
  return pmNarrowInternal(recipients.map(r => r.user_id), recipients.map(r => r.email));
};

/**
 * A 1:1 PM narrow, possibly with self.
 *
 * This has the same effect as calling pmNarrowFromUsers, but for code that
 * statically has just one other user it's a bit more convenient because it
 * doesn't require going through our `recipient` helpers.
 */
export const pm1to1NarrowFromUser = (user: UserOrBot): Narrow =>
  pmNarrowInternal([user.user_id], [user.email]);

export const specialNarrow = (operand: string): Narrow => {
  if (operand === 'starred') {
    return Object.freeze({ type: 'starred' });
  }
  if (operand === 'mentioned') {
    return Object.freeze({ type: 'mentioned' });
  }
  if (operand === 'private') {
    return Object.freeze({ type: 'all-pm' });
  }
  throw new Error(`specialNarrow: got unsupported operand: ${operand}`);
};

export const STARRED_NARROW = specialNarrow('starred');

export const STARRED_NARROW_STR = keyFromNarrow(STARRED_NARROW);

export const MENTIONED_NARROW = specialNarrow('mentioned');

export const MENTIONED_NARROW_STR = keyFromNarrow(MENTIONED_NARROW);

export const ALL_PRIVATE_NARROW = specialNarrow('private');

export const ALL_PRIVATE_NARROW_STR = keyFromNarrow(ALL_PRIVATE_NARROW);

export const streamNarrow = (stream: string): Narrow =>
  Object.freeze({ type: 'stream', streamName: stream });

export const topicNarrow = (stream: string, topic: string): Narrow =>
  Object.freeze({ type: 'topic', streamName: stream, topic });

export const SEARCH_NARROW = (query: string): Narrow => Object.freeze({ type: 'search', query });

type NarrowCases<T> = {|
  home: () => T,
  pm: (emails: $ReadOnlyArray<string>, ids: $ReadOnlyArray<number>) => T,
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
    throw new Error(`bad narrow: ${JSON.stringify(narrow)}`);
  };

  switch (narrow.type) {
    case 'stream': return cases.stream(narrow.streamName);
    case 'topic': return cases.topic(narrow.streamName, narrow.topic);
    case 'pm': return cases.pm(narrow.emails, narrow.userIds);
    case 'search': return cases.search(narrow.query);
    case 'all': return cases.home();
    case 'starred': return cases.starred();
    case 'mentioned': return cases.mentioned();
    case 'all-pm': return cases.allPrivate();
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

/**
 * The key we use for this narrow in our Redux data structures.
 *
 * See in particular `NarrowsState`, `CaughtUpState`, `FetchingState`,
 * and `DraftsState`.
 *
 * The key may contain arbitrary Unicode codepoints.  If passing through a
 * channel (like an HTML attribute) that only allows certain codepoints, use
 * something like `base64Utf8Encode` to encode into the permitted subset.
 */
// The arbitrary Unicode codepoints come from (a) stream names and topics,
// and (b) our use of `\x00` as a delimiter.  Also perhaps email addresses,
// if it's possible for those to have exciting characters in them.
export function keyFromNarrow(narrow: Narrow): string {
  // The ":s" (for "string") in several of these is to keep them disjoint,
  // out of an abundance of caution, from future keys that use numeric IDs.
  //
  // Similarly, ":d" ("dual") marks those with both numeric IDs and strings.
  return caseNarrow(narrow, {
    // NB if you're changing any of these: be sure to do a migration.
    // Take a close look at migration 19 and any later related migrations.

    stream: name => `stream:s:${name}`,
    // '\x00' is the one character not allowed in Zulip stream names.
    // (See `check_stream_name` in zulip.git:zerver/lib/streams.py.)
    topic: (streamName, topic) => `topic:s:${streamName}\x00${topic}`,

    // An earlier version had `pm:s:`.
    pm: (emails, ids) => `pm:d:${ids.join(',')}:${emails.join(',')}`,

    home: () => 'all',
    starred: () => 'starred',
    mentioned: () => 'mentioned',
    allPrivate: () => 'all-pm',
    search: query => `search:${query}`,
  });
}

/**
 * Parse a narrow previously encoded with keyFromNarrow.
 */
export const parseNarrow = (narrowStr: string): Narrow => {
  const makeError = () => new Error('parseNarrow: bad narrow');

  const tag = /^.*?(?::|$)/.exec(narrowStr)?.[0] ?? '';
  const rest = narrowStr.substr(tag.length);
  // invariant: tag + rest === narrowStr
  switch (tag) {
    case 'stream:': {
      if (!rest.startsWith('s:')) {
        throw makeError();
      }
      const name = rest.substr('s:'.length);
      return streamNarrow(name);
    }

    case 'topic:': {
      // The `/s` regexp flag means the `.` patterns match absolutely
      // anything.  By default they reject certain "newline" characters,
      // which in principle could appear in stream names or topics.
      // eslint-disable-next-line no-control-regex
      const match = /^s:(.*?)\x00(.*)/s.exec(rest);
      if (!match) {
        throw makeError();
      }
      return topicNarrow(match[1], match[2]);
    }

    case 'pm:': {
      // The `/s` regexp flag means the `.` patterns match absolutely
      // anything.  By default they reject certain "newline" characters,
      // which might be impossible in email addresses but it's simplest
      // not to have to care.
      const match = /^d:(.*?):(.*)/s.exec(rest);
      if (!match) {
        throw makeError();
      }
      const ids = match[1].split(',').map(s => Number.parseInt(s, 10));
      const emails = match[2].split(',');
      return pmNarrowInternal(ids, emails);
    }

    case 'search:': {
      return SEARCH_NARROW(rest);
    }

    default:
      if (rest !== '') {
        throw makeError();
      }

      switch (tag) {
        case 'all':
          return HOME_NARROW;
        case 'starred':
          return STARRED_NARROW;
        case 'mentioned':
          return MENTIONED_NARROW;
        case 'all-pm':
          return ALL_PRIVATE_NARROW;
        default:
          throw makeError();
      }
  }
};

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
export const emailsOfGroupPmNarrow = (narrow: Narrow): $ReadOnlyArray<string> =>
  caseNarrowPartial(narrow, {
    pm: emails => {
      if (emails.length === 1) {
        throw new Error('emailsOfGroupPmNarrow: got 1:1 narrow');
      }
      return emails;
    },
  });

/**
 * The "other" user's email for a 1:1 PM narrow; else error.
 *
 * With "other" in scare-quotes because for the self-PM narrow, this is the
 * self user.
 *
 * Any caller of this probably should be getting a whole user object instead
 * of a Narrow in the first place.  And then that wrinkle about the self-PM
 * narrow vs. other 1:1 narrows is a UI decision that can get made
 * explicitly at the appropriate spot.
 */
export const emailOfPm1to1Narrow = (narrow: Narrow): string =>
  caseNarrowPartial(narrow, {
    pm: emails => {
      invariant(emails.length === 1, 'emailOfPm1to1Narrow: got group-PM narrow');
      return emails[0];
    },
  });

/**
 * The "PM key recipients" emails for a PM narrow; else error.
 *
 * This is the same list of users that can appear in a `PmKeyRecipients` or
 * `PmKeyUsers`, but contains only their emails.
 */
export const emailsOfPmNarrow = (narrow: Narrow): $ReadOnlyArray<string> =>
  caseNarrowPartial(narrow, { pm: emails => emails });

/**
 * The stream name for a stream or topic narrow; else error.
 *
 * Most callers of this should probably be getting passed a stream name
 * instead of a Narrow in the first place; or if they do handle other kinds
 * of narrows, should be using `caseNarrow`.
 */
export const streamNameOfNarrow = (narrow: Narrow): string =>
  caseNarrowPartial(narrow, { stream: name => name, topic: streamName => streamName });

/**
 * The topic for a topic narrow; else error.
 *
 * Most callers of this should probably be getting passed a topic (and a
 * stream name) instead of a Narrow in the first place; or if they do handle
 * other kinds of narrows, should be using `caseNarrow`.
 */
export const topicOfNarrow = (narrow: Narrow): string =>
  caseNarrowPartial(narrow, { topic: (streamName, topic) => topic });

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
 * Convert the narrow into the form used in the Zulip API at get-messages.
 */
export const apiNarrowOfNarrow = (narrow: Narrow): ApiNarrow =>
  caseNarrow(narrow, {
    stream: streamName => [{ operator: 'stream', operand: streamName }],
    topic: (streamName, topic) => [
      { operator: 'stream', operand: streamName },
      { operator: 'topic', operand: topic },
    ],
    pm: emails => [{ operator: 'pm-with', operand: emails.join(',') }],
    search: query => [{ operator: 'search', operand: query }],
    home: () => [],
    starred: () => [{ operator: 'is', operand: 'starred' }],
    mentioned: () => [{ operator: 'is', operand: 'mentioned' }],
    allPrivate: () => [{ operator: 'is', operand: 'private' }],
  });

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
  ownUser: User,
): boolean =>
  caseNarrow(narrow, {
    home: () => true,
    stream: name => message.type === 'stream' && name === streamNameOfStreamMessage(message),
    topic: (streamName, topic) =>
      message.type === 'stream'
      && streamName === streamNameOfStreamMessage(message)
      && topic === message.subject,
    pm: (emails, ids) => {
      if (message.type !== 'private') {
        return false;
      }
      const recipients = recipientsOfPrivateMessage(message).map(r => r.id);
      const narrowAsRecipients = ids;
      return (
        normalizeRecipientsAsUserIdsSansMe(recipients, ownUser.user_id)
        === normalizeRecipientsAsUserIdsSansMe(narrowAsRecipients, ownUser.user_id)
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
