/* @flow */
import type { Props } from '../../message/MessageList';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';
import { getGravatarFromEmail } from '../../utils/avatar';

export default ({
  auth,
  subscriptions,
  realmEmoji,
  renderedMessages,
  narrow,
  twentyFourHourTime,
}: Props): string =>
  renderedMessages
    .reduce((list, section, index) => {
      list.push(
        messageHeaderAsHtml({
          auth,
          item: section.message,
          subscriptions,
          narrow,
        }),
      );

      section.data.forEach((item, idx) => {
        if (item.type === 'time') {
          list.push(timeRowAsHtml(item.timestamp, item.firstMessage));
        } else {
          const { message } = item;
          list.push(
            messageAsHtml({
              id: message.id,
              isBrief: item.isBrief,
              fromName: message.sender_full_name,
              fromEmail: message.sender_email,
              content: message.match_content || message.content,
              flags: message.flags || [],
              timestamp: message.timestamp,
              avatarUrl: message.avatar_url || getGravatarFromEmail(message.sender_email),
              timeEdited: message.last_edit_timestamp,
              isOutbox: message.isOutbox,
              reactions: message.reactions,
              ownEmail: auth.email,
              realmEmoji,
              twentyFourHourTime,
            }),
          );
        }
      });

      return list;
    }, [])
    .join('');
