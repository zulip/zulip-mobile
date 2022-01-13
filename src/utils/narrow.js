/* @flow strict-local */

import { makeUserId } from '../api/idTypes';
import type { ApiNarrow, Message, Outbox, Stream, UserId, UserOrBot } from '../types';
import {
  normalizeRecipientsAsUserIdsSansMe,
  pmKeyRecipientsFromMessage,
  recipientsOfPrivateMessage,
  type PmKeyRecipients,
  type PmKeyUsers,
  pmKeyRecipientsFromPmKeyUsers,
  pmKeyRecipientsFor1to1,
  makePmKeyRecipients_UNSAFE,
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
  | {| type: 'stream', streamId: number |}
  | {| type: 'topic', streamId: number, topic: string |}
  | {| type: 'pm', userIds: PmKeyRecipients |}
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
const pmNarrowInternal = (userIds: PmKeyRecipients): Narrow =>
  Object.freeze({ type: 'pm', userIds });

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
  pmNarrowInternal(recipients);

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
  pmNarrowInternal(pmKeyRecipientsFromPmKeyUsers(recipients));

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
export const pmNarrowFromUsersUnsafe = (recipients: $ReadOnlyArray<UserOrBot>): Narrow => {
  const userIds = recipients.map(u => u.user_id).sort((a, b) => a - b);
  // This call is unsafe, but that's why this function is too.
  return pmNarrowInternal(makePmKeyRecipients_UNSAFE(userIds));
};

/**
 * A 1:1 PM narrow, possibly with self.
 *
 * This has the same effect as calling pmNarrowFromUsers, but for code that
 * statically has just one other user it's a bit more convenient because it
 * doesn't require going through our `recipient` helpers.
 */
export const pm1to1NarrowFromUser = (user: UserOrBot): Narrow =>
  pmNarrowInternal(pmKeyRecipientsFor1to1(user.user_id));

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

export const STARRED_NARROW: Narrow = specialNarrow('starred');

export const STARRED_NARROW_STR: string = keyFromNarrow(STARRED_NARROW);

export const MENTIONED_NARROW: Narrow = specialNarrow('mentioned');

export const MENTIONED_NARROW_STR: string = keyFromNarrow(MENTIONED_NARROW);

export const ALL_PRIVATE_NARROW: Narrow = specialNarrow('private');

export const ALL_PRIVATE_NARROW_STR: string = keyFromNarrow(ALL_PRIVATE_NARROW);

export const streamNarrow = (streamId: number): Narrow =>
  Object.freeze({ type: 'stream', streamId });

export const topicNarrow = (streamId: number, topic: string): Narrow =>
  Object.freeze({ type: 'topic', streamId, topic });

export const SEARCH_NARROW = (query: string): Narrow => Object.freeze({ type: 'search', query });

type NarrowCases<T> = {|
  home: () => T,
  pm: (ids: PmKeyRecipients) => T,
  starred: () => T,
  mentioned: () => T,
  allPrivate: () => T,
  stream: (streamId: number) => T,
  topic: (streamId: number, topic: string) => T,
  search: (query: string) => T,
|};

/* prettier-ignore */
export function caseNarrow<T>(narrow: Narrow, cases: NarrowCases<T>): T {
  const err = (): empty => {
    throw new Error(`bad narrow: ${JSON.stringify(narrow)}`);
  };

  switch (narrow.type) {
    case 'stream': return cases.stream(narrow.streamId);
    case 'topic': return cases.topic(narrow.streamId, narrow.topic);
    case 'pm': return cases.pm(narrow.userIds);
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
// The arbitrary Unicode codepoints come from topics.  (These aren't
// *completely* arbitrary, but close enough that there's little to gain
// from relying on constraints on them.)
export function keyFromNarrow(narrow: Narrow): string {
  // The ":s" (for "string") in several of these was to keep them disjoint,
  // out of an abundance of caution, from later keys that use numeric IDs.
  //
  // Similarly, ":d" ("dual") marked those with both numeric IDs and strings.
  return caseNarrow(narrow, {
    // NB if you're changing any of these: be sure to do a migration.
    // Take a close look at migration 19 and any later related migrations.

    // An earlier version had `stream:s:`.  Another had `stream:d:`.
    stream: streamId => `stream:${streamId}`,

    // An earlier version had `topic:s:`.  Another had `topic:d:`.
    topic: (streamId, topic) => `topic:${streamId}:${topic}`,

    // An earlier version had `pm:s:`.  Another had `pm:d:`.
    pm: ids => `pm:${ids.join(',')}`,

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
      if (!/^\d+$/.test(rest)) {
        throw makeError();
      }
      return streamNarrow(Number.parseInt(rest, 10));
    }

    case 'topic:': {
      // The `/s` regexp flag means the `.` pattern matches absolutely
      // anything.  By default it rejects certain "newline" characters,
      // which in principle could appear in topics.
      const match = /^(\d+):(.*)/s.exec(rest);
      if (!match) {
        throw makeError();
      }
      return topicNarrow(Number.parseInt(match[1], 10), match[2]);
    }

    case 'pm:': {
      const ids = rest.split(',').map(s => makeUserId(Number.parseInt(s, 10)));
      // Here we're relying on the key having been encoded from a
      // correct list of users.
      return pmNarrowInternal(makePmKeyRecipients_UNSAFE(ids));
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
  !!narrow && caseNarrowDefault(narrow, { pm: ids => ids.length === 1 }, () => false);

export const isGroupPmNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { pm: ids => ids.length > 1 }, () => false);

/**
 * The "PM key recipients" IDs for a PM narrow; else error.
 *
 * This is the same list of users that can appear in a `PmKeyRecipients` or
 * `PmKeyUsers`, but contains only their user IDs.
 */
export const userIdsOfPmNarrow = (narrow: Narrow): PmKeyRecipients =>
  caseNarrowPartial(narrow, { pm: ids => ids });

/**
 * The stream ID for a stream or topic narrow; else error.
 *
 * Most callers of this should probably be getting passed a stream ID
 * instead of a Narrow in the first place; or if they do handle other kinds
 * of narrows, should be using `caseNarrow`.
 */
export const streamIdOfNarrow = (narrow: Narrow): number =>
  caseNarrowPartial(narrow, { stream: id => id, topic: id => id });

/**
 * The topic for a topic narrow; else error.
 *
 * Most callers of this should probably be getting passed a topic (and a
 * stream name) instead of a Narrow in the first place; or if they do handle
 * other kinds of narrows, should be using `caseNarrow`.
 */
export const topicOfNarrow = (narrow: Narrow): string =>
  caseNarrowPartial(narrow, { topic: (id, topic) => topic });

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

export const isMentionedNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { mentioned: () => true }, () => false);

/**
 * Whether the narrow represents a single whole conversation.
 *
 * A conversation is the smallest unit that discussions are threaded into:
 * either a specific topic in a stream, or a PM thread (either 1:1 or group).
 *
 * When sending a message, its destination is identified by a conversation.
 */
export const isConversationNarrow = (narrow: Narrow): boolean =>
  caseNarrowDefault(narrow, { topic: () => true, pm: () => true }, () => false);

/**
 * Convert the narrow into the form used in the Zulip API at get-messages.
 */
export const apiNarrowOfNarrow = (
  narrow: Narrow,
  allUsersById: Map<UserId, UserOrBot>,
  streamsById: Map<number, Stream>,
): ApiNarrow => {
  const get = <K, V>(description, map: Map<K, V>, key: K): V => {
    const result = map.get(key);
    if (result === undefined) {
      throw new Error(`apiNarrowOfNarrow: missing ${description}`);
    }
    return result;
  };

  return caseNarrow(narrow, {
    stream: streamId => [
      // TODO(server-2.1): just send stream ID instead
      { operator: 'stream', operand: get('stream', streamsById, streamId).name },
    ],
    topic: (streamId, topic) => [
      // TODO(server-2.1): just send stream ID instead
      { operator: 'stream', operand: get('stream', streamsById, streamId).name },
      { operator: 'topic', operand: topic },
    ],
    pm: ids => {
      const emails = ids.map(id => get('user', allUsersById, id).email);
      // TODO(server-2.1): just send IDs instead
      return [{ operator: 'pm-with', operand: emails.join(',') }];
    },
    search: query => [{ operator: 'search', operand: query }],
    home: () => [],
    starred: () => [{ operator: 'is', operand: 'starred' }],
    mentioned: () => [{ operator: 'is', operand: 'mentioned' }],
    allPrivate: () => [{ operator: 'is', operand: 'private' }],
  });
};

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
  ownUserId: UserId,
): boolean =>
  caseNarrow(narrow, {
    home: () => true,
    stream: streamId => message.type === 'stream' && streamId === message.stream_id,
    topic: (streamId, topic) =>
      message.type === 'stream' && streamId === message.stream_id && topic === message.subject,
    pm: ids => {
      if (message.type !== 'private') {
        return false;
      }
      const recipients = recipientsOfPrivateMessage(message).map(r => r.id);
      const narrowAsRecipients = ids;
      return (
        normalizeRecipientsAsUserIdsSansMe(recipients, ownUserId)
        === normalizeRecipientsAsUserIdsSansMe(narrowAsRecipients, ownUserId)
      );
    },
    starred: () => flags.includes('starred'),
    mentioned: () => flags.includes('mentioned') || flags.includes('wildcard_mentioned'),
    allPrivate: () => message.type === 'private',
    search: () => false,
    // Adding a case here?  Be sure to add to getNarrowsForMessage, too.
  });

/**
 * Whether we show the compose box on this narrow's message list.
 *
 * This is really a UI choice that belongs to a specific part of the UI.
 * It's here for now because several files refer to it.
 */
// TODO make this appropriately part of the UI code.
export const showComposeBoxOnNarrow = (narrow: Narrow): boolean =>
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
  ownUserId: UserId,
  flags: $ReadOnlyArray<string>,
): $ReadOnlyArray<Narrow> => {
  const result = [];

  // All messages are in the home narrow.
  result.push(HOME_NARROW);

  if (message.type === 'private') {
    result.push(ALL_PRIVATE_NARROW);
    result.push(pmNarrowFromRecipients(pmKeyRecipientsFromMessage(message, ownUserId)));
  } else {
    result.push(topicNarrow(message.stream_id, message.subject));
    result.push(streamNarrow(message.stream_id));
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
export const getNarrowForReply = (message: Message | Outbox, ownUserId: UserId): Narrow => {
  if (message.type === 'private') {
    return pmNarrowFromRecipients(pmKeyRecipientsFromMessage(message, ownUserId));
  } else {
    return topicNarrow(message.stream_id, message.subject);
  }
};
