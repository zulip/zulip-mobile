/* @flow strict-local */
import invariant from 'invariant';
import { createSelector } from 'reselect';

import type { PerAccountState, PmMessage, PmConversationData, Selector } from '../types';
import { getPrivateMessages } from '../message/messageSelectors';
import { getAllUsersById, getOwnUserId } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import {
  pmUnreadsKeyFromMessage,
  pmKeyRecipientUsersFromMessage,
  pmKeyRecipientUsersFromIds,
  pmUnreadsKeyFromPmKeyIds,
  pmKeyRecipientsFromPmKeyUsers,
} from '../utils/recipient';
import { getServerVersion } from '../account/accountsSelectors';
import * as model from './pmConversationsModel';
import { type PmConversationsState } from './pmConversationsModel';

function unreadCount(unreadsKey, unreadPms, unreadHuddles): number {
  // This business of looking in one place and then the other is kind
  // of messy.  Fortunately it always works, because the key spaces
  // are disjoint: all `unreadHuddles` keys contain a comma, and all
  // `unreadPms` keys don't.
  /* $FlowFixMe[incompatible-type]: The keys of unreadPms are
       logically numbers... but because it's an object, they end up
       converted to strings, so this access with string keys works.
       We should probably use a Map for this and similar maps. */
  return unreadPms[unreadsKey] || unreadHuddles[unreadsKey];
}

// TODO(server-2.1): Delete this, and simplify logic around it.
export const getRecentConversationsLegacy: Selector<PmConversationData[]> = createSelector(
  getOwnUserId,
  getPrivateMessages,
  getUnreadByPms,
  getUnreadByHuddles,
  getAllUsersById,
  (
    ownUserId,
    messages: PmMessage[],
    unreadPms: {| [number]: number |},
    unreadHuddles: {| [string]: number |},
    allUsersById,
  ): PmConversationData[] => {
    const items = messages
      .map(msg => {
        // Note this can be a different set of users from those in `keyRecipients`.
        const unreadsKey = pmUnreadsKeyFromMessage(msg, ownUserId);
        const keyRecipients = pmKeyRecipientUsersFromMessage(msg, allUsersById, ownUserId);
        return keyRecipients === null ? null : { unreadsKey, keyRecipients, msgId: msg.id };
      })
      .filter(Boolean);

    const latestByRecipients = new Map();
    items.forEach(item => {
      const prev = latestByRecipients.get(item.unreadsKey);
      if (!prev || item.msgId > prev.msgId) {
        latestByRecipients.set(item.unreadsKey, item);
      }
    });

    const sortedByMostRecent = Array.from(latestByRecipients.values()).sort(
      (a, b) => +b.msgId - +a.msgId,
    );

    return sortedByMostRecent.map(conversation => ({
      key: conversation.unreadsKey,
      keyRecipients: conversation.keyRecipients,
      msgId: conversation.msgId,
      unread: unreadCount(conversation.unreadsKey, unreadPms, unreadHuddles),
    }));
  },
);

export const getRecentConversationsModern: Selector<PmConversationData[]> = createSelector(
  state => state.pmConversations,
  getUnreadByPms,
  getUnreadByHuddles,
  getAllUsersById,
  getOwnUserId,
  // This is defined separately, just below.  When this is defined inline,
  // if there's a type error in it, the message Flow gives is often pretty
  // terrible: just highlighting the whole thing and pointing at something
  // in the `reselect` libdef.  Defining it separately seems to help.
  getRecentConversationsModernImpl, // eslint-disable-line no-use-before-define
);

function getRecentConversationsModernImpl(
  { sorted, map }: PmConversationsState,
  unreadPms,
  unreadHuddles,
  allUsersById,
  ownUserId,
): PmConversationData[] {
  return sorted
    .toSeq()
    .map(recentsKey => {
      const keyRecipients = pmKeyRecipientUsersFromIds(
        model.usersOfKey(recentsKey),
        allUsersById,
        ownUserId,
      );
      if (keyRecipients === null) {
        return null;
      }

      const unreadsKey = pmUnreadsKeyFromPmKeyIds(
        pmKeyRecipientsFromPmKeyUsers(keyRecipients),
        ownUserId,
      );

      const msgId = map.get(recentsKey);
      invariant(msgId !== undefined, 'pm-conversations: key in sorted should be in map');

      const unread = unreadCount(unreadsKey, unreadPms, unreadHuddles);

      return { key: unreadsKey, keyRecipients, msgId, unread };
    })
    .filter(Boolean)
    .toArray();
}

const getServerIsOld: Selector<boolean> = createSelector(
  getServerVersion,
  version => !version.isAtLeast(model.MIN_RECENTPMS_SERVER_VERSION),
);

/**
 * The most recent PM conversations, with unread count and latest message ID.
 */
export const getRecentConversations = (state: PerAccountState): PmConversationData[] =>
  getServerIsOld(state) ? getRecentConversationsLegacy(state) : getRecentConversationsModern(state);

export const getUnreadConversations: Selector<
  PmConversationData[],
> = createSelector(getRecentConversations, conversations =>
  conversations.filter(c => c.unread > 0),
);
