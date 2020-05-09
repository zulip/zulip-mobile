/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Message, PmConversationData, Selector, User } from '../types';
import { getPrivateMessages } from '../message/messageSelectors';
import { getOwnUser } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { normalizeRecipientsSansMe, pmUnreadsKeyFromMessage } from '../utils/recipient';

/**
 * Given a list of PmConversationPartial or PmConversationData, trim it down to
 * contain only the most recent message from any conversation, and return them
 * sorted by recency.
 */
const collateByRecipient = <T: { recipients: string, msgId: number }>(
  items: $ReadOnlyArray<T>,
): T[] => {
  const latestByRecipient = new Map();
  items.forEach(item => {
    const prev = latestByRecipient.get(item.recipients);
    if (!prev || item.msgId > prev.msgId) {
      latestByRecipient.set(item.recipients, item);
    }
  });

  const sortedByMostRecent = Array.from(latestByRecipient.values()).sort(
    (a, b) => +b.msgId - +a.msgId,
  );

  return sortedByMostRecent;
};

type PmConversationPartial = $Diff<PmConversationData, {| unread: mixed |}>;
type UnreadAttacher = ($ReadOnlyArray<PmConversationPartial>) => PmConversationData[];

/**
 * Auxiliary function: fragment of the selector(s) for PmConversationData.
 * Transforms PmConversationPartial[] to PmConversationData[].
 *
 * Note that, since this will only ever be called by other selectors, the inner
 * function doesn't need to do any memoization of its own.
 */
const getAttachUnread: Selector<UnreadAttacher> = createSelector(
  getUnreadByPms,
  getUnreadByHuddles,
  (unreadPms: { [number]: number }, unreadHuddles: { [string]: number }) => (
    partials: $ReadOnlyArray<PmConversationPartial>,
  ) =>
    partials.map(recipient => ({
      ...recipient,
      unread:
        // This business of looking in one place and then the other is kind
        // of messy.  Fortunately it always works, because the key spaces
        // are disjoint: all `unreadHuddles` keys contain a comma, and all
        // `unreadPms` keys don't.
        /* $FlowFixMe: The keys of unreadPms are logically numbers, but because it's an object they
         end up converted to strings, so this access with string keys works.  We should probably use
         a Map for this and similar maps. */
        unreadPms[recipient.ids] || unreadHuddles[recipient.ids],
    })),
);

export const getRecentConversations: Selector<PmConversationData[]> = createSelector(
  getOwnUser,
  getPrivateMessages,
  getAttachUnread,
  (ownUser: User, messages: Message[], attachUnread: UnreadAttacher): PmConversationData[] => {
    const items = messages.map(msg => ({
      ids: pmUnreadsKeyFromMessage(msg, ownUser.user_id),
      recipients: normalizeRecipientsSansMe(msg.display_recipient, ownUser.email),
      msgId: msg.id,
    }));

    const sortedByMostRecent = collateByRecipient(items);

    return attachUnread(sortedByMostRecent);
  },
);

export const getUnreadConversations: Selector<PmConversationData[]> = createSelector(
  getRecentConversations,
  conversations => conversations.filter(c => c.unread > 0),
);
