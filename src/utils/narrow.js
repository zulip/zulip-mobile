/* @flow strict-local */
import isEqual from 'lodash.isequal';
import unescape from 'lodash.unescape';

import type { Narrow, Message, Outbox, User } from '../types';
import {
  normalizeRecipientsSansMe,
  pmKeyRecipientsFromMessage,
  recipientsOfPrivateMessage,
  streamNameOfStreamMessage,
} from './recipient';

export const isSameNarrow = (narrow1: Narrow, narrow2: Narrow): boolean =>
  Array.isArray(narrow1) && Array.isArray(narrow2) && isEqual(narrow1, narrow2);

export const parseNarrowString = (narrowStr: string): Narrow => JSON.parse(unescape(narrowStr));

export const HOME_NARROW: Narrow = [];

export const HOME_NARROW_STR: string = '[]';

/**
 * A PM narrow -- either 1:1 or group.
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
 * A group PM narrow.
 *
 * The users represented in `emails` should agree, as a (multi)set, with
 * `pmKeyRecipientsFromMessage`.  But this isn't checked, and we've had bugs
 * where they don't; some consumers of this data re-normalize to be sure.
 *
 * They might not have a consistent sorting.  (This would be good to fix.)
 * Consumers of this data should sort for themselves when making comparisons.
 */
// Ideally, all callers should agree on how they're sorted, too.  Because
// they don't, we have latent bugs (possibly a live one somewhere) where we
// can wind up with several distinct narrows that are actually the same
// group PM conversation.
//
// For example this happens if you have a group PM conversation where email
// and ID sorting don't happen to coincide; visit a group PM conversation
// from the main nav (either the unreads or PMs screen) -- which sorts by
// email; and then visit the same conversation from a recipient bar on the
// "all messages" narrow -- which sorts by ID.  The Redux logs in the
// debugger will show two different entries in `state.narrows`.  This bug is
// merely latent only because it doesn't (as far as we know) have any
// user-visible effect.
//
// Known call stacks:
//  * OK, perilously, unsorted: CreateGroupScreen: the self user isn't
//      offered in the UI, so effectively the list is filtered; can call
//      with just one email, but happily this works out the same as pmNarrow
//  * OK, email: PmConversationList < PmConversationCard: the data comes
//      from `getRecentConversations`, which filters and sorts by email
//  * OK, email: PmConversationList < UnreadCards: ditto
//  * OK, unsorted: getNarrowFromLink.  Though there's basically a bug in
//      the webapp, where the URL that appears in the location bar for a
//      group PM conversation excludes self -- so it's unusable if you try
//      to give someone else in it a link to a particular message, say.
//  * OK, unsorted: getNarrowFromMessage
//  * Good: getNarrowFromNotificationData: filters, and starts from
//      notification's pm_users, which is sorted.
//  * Good: messageHeaderAsHtml: comes from pmKeyRecipientsFromMessage,
//      which filters and sorts by ID
export const pmNarrowFromEmails = (emails: string[]): Narrow => pmNarrowByString(emails.join());

/** Convenience wrapper for `pmNarrowFromEmails`. */
export const pmNarrowFromEmail = (email: string): Narrow => pmNarrowFromEmails([email]);

export const specialNarrow = (operand: string): Narrow => [
  {
    operator: 'is',
    operand,
  },
];

export const STARRED_NARROW = specialNarrow('starred');

export const STARRED_NARROW_STR = JSON.stringify(STARRED_NARROW);

export const MENTIONED_NARROW = specialNarrow('mentioned');

export const MENTIONED_NARROW_STR = JSON.stringify(MENTIONED_NARROW);

export const ALL_PRIVATE_NARROW = specialNarrow('private');

export const ALL_PRIVATE_NARROW_STR = JSON.stringify(ALL_PRIVATE_NARROW);

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
  pm: (email: string) => T,
  groupPm: (emails: string[]) => T,
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

  switch (narrow.length) {
    case 0: return cases.home();
    case 1:
      switch (narrow[0].operator) {
        case 'pm-with':
          if (narrow[0].operand.indexOf(',') < 0) {
            return cases.pm(narrow[0].operand);
          } else { /* eslint-disable-line */
            const emails = narrow[0].operand.split(',');
            return cases.groupPm(emails);
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
    throw new Error(`unexpected ${type} narrow: ${JSON.stringify(narrow)}`);
  };
  return caseNarrow(
    narrow,
    Object.assign(
      ({
        home: err('home'),
        pm: err('PM'),
        groupPm: err('group PM'),
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
        groupPm: defaultCase,
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
  !!narrow && caseNarrowDefault(narrow, { pm: () => true }, () => false);

export const isGroupPmNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { groupPm: () => true }, () => false);

/**
 * The recipients' emails if a group PM narrow; else error.
 *
 * Any use of this probably means something higher up should be refactored
 * to use caseNarrow.
 */
export const emailsOfGroupNarrow = (narrow: Narrow): string[] =>
  caseNarrowPartial(narrow, { groupPm: emails => emails });

export const isPmNarrow = (narrow?: Narrow): boolean =>
  !!narrow && caseNarrowDefault(narrow, { pm: () => true, groupPm: () => true }, () => false);

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
 */
export const isMessageInNarrow = (
  message: Message | Outbox,
  flags: $ReadOnlyArray<string>,
  narrow: Narrow,
  ownEmail: string,
): boolean => {
  const matchPmRecipients = (emails: string[]) => {
    if (message.type !== 'private') {
      return false;
    }
    const recipients = recipientsOfPrivateMessage(message);
    const narrowAsRecipients = emails.map(email => ({ email }));
    return (
      normalizeRecipientsSansMe(recipients, ownEmail)
      === normalizeRecipientsSansMe(narrowAsRecipients, ownEmail)
    );
  };

  return caseNarrow(narrow, {
    home: () => true,
    stream: name => message.type === 'stream' && name === streamNameOfStreamMessage(message),
    topic: (streamName, topic) =>
      message.type === 'stream'
      && streamName === streamNameOfStreamMessage(message)
      && topic === message.subject,
    pm: email => matchPmRecipients([email]),
    groupPm: matchPmRecipients,
    starred: () => flags.includes('starred'),
    mentioned: () => flags.includes('mentioned') || flags.includes('wildcard_mentioned'),
    allPrivate: () => message.type === 'private',
    search: () => false,
  });
};

export const canSendToNarrow = (narrow: Narrow): boolean =>
  caseNarrow(narrow, {
    pm: () => true,
    groupPm: () => true,
    stream: () => true,
    topic: () => true,
    home: () => false,
    starred: () => false,
    mentioned: () => false,
    allPrivate: () => false,
    search: () => false,
  });

/**
 * Careful: quirky behavior on a stream message with empty topic.
 *
 * If you think you want to reuse this function: study carefully; maybe
 * refactor it to something cleaner first; if not, then definitely document
 * its quirky behavior.
 */
// TODO: do that, or just make this a private local helper of its one caller
export const getNarrowFromMessage = (message: Message | Outbox, ownUser: User) => {
  if (message.type === 'private') {
    return pmNarrowFromEmails(pmKeyRecipientsFromMessage(message, ownUser).map(x => x.email));
  } else {
    const streamName = streamNameOfStreamMessage(message);
    const topic = message.subject;
    if (topic && topic.length) {
      return topicNarrow(streamName, topic);
    }
    return streamNarrow(streamName);
  }
};
