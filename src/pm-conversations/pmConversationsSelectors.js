/* @flow strict-local */
import { createSelector } from 'reselect';

import type { RecentPrivateConversation, PmConversationData, Selector, User } from '../types';
import { getRecentPrivateConversations } from '../directSelectors';
import { getOwnUser, getAllUserEmails } from '../users/userSelectors';
import { getUnreadByPms, getUnreadByHuddles } from '../unread/unreadSelectors';
import { normalizeRecipientsSansMe, sortIds } from '../utils/recipient';

export const getRecentConversations: Selector<PmConversationData[]> = createSelector(
  getRecentPrivateConversations,
  getAllUserEmails,
  getOwnUser,
  getUnreadByPms,
  getUnreadByHuddles,
  (
    recentPrivateConversations: RecentPrivateConversation[],
    emails: $ReadOnly<{ [user_id: number]: string }>,
    ownUser: User,
    unreadPms: { [number]: number },
    unreadHuddles: { [string]: number },
  ): PmConversationData[] => {
    const recipients = recentPrivateConversations.map(conversation => {
      const conversationUserIdsIncludeMe = conversation.user_ids.slice();
      if (conversationUserIdsIncludeMe.length !== 1) {
        conversationUserIdsIncludeMe.push(ownUser.user_id);
      }
      return {
        ids: sortIds(conversationUserIdsIncludeMe),
        recipients: normalizeRecipientsSansMe(
          conversationUserIdsIncludeMe.map(id => ({ email: emails[id] })),
          ownUser.email,
        ),
        msgId: conversation.max_message_id,
      };
    });
    const sortedByMostRecent = recipients.sort((a, b) => +b.msgId - +a.msgId);

    return sortedByMostRecent.map(recipient => ({
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
    }));
  },
);

export const getUnreadConversations: Selector<PmConversationData[]> = createSelector(
  getRecentConversations,
  conversations => conversations.filter(c => c.unread > 0),
);
