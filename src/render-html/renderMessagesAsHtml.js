/* @flow */
import { getFullUrl } from '../utils/url';

import type { Props } from '../message/MessageListContainer';
import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';

const renderMessages = ({
  auth,
  subscriptions,
  realmEmoji,
  renderedMessages,
  narrow,
}: Props): string[] =>
  renderedMessages.reduce((list, section, index) => {
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
            avatarUrl: getFullUrl(message.avatar_url, auth ? auth.realm : ''),
            timeEdited: message.last_edit_timestamp,
            isOutbox: message.isOutbox,
            reactions: message.reactions,
            ownEmail: auth.email,
            realmEmoji,
            twentyFourHourTime: false,
          }),
        );
      }
    });

    return list; // eslint-disable-next-line
  }, []);

export default (props: Props): string => {
  const { auth } = props;

  return renderMessages(props).join('');
};
