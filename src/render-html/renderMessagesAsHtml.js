import { getFullUrl } from '../utils/url';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';

const renderMessages = ({ auth, subscriptions, realmEmoji, renderedMessages, narrow }) =>
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
        list.push(
          messageAsHtml({
            id: item.message.id,
            isBrief: item.isBrief,
            fromName: item.message.sender_full_name,
            fromEmail: item.message.sender_email,
            content: item.message.content,
            flags: item.message.flags || [],
            timestamp: item.message.timestamp,
            avatarUrl: getFullUrl(item.message.avatar_url, auth ? auth.realm : ''),
            timeEdited: item.message.last_edit_timestamp,
            isOutbox: item.message.isOutbox,
            reactions: item.message.reactions,
            ownEmail: auth.email,
            realmEmoji,
          }),
        );
      }
    });

    return list; // eslint-disable-next-line
  }, []);

export default props => {
  const { auth } = props;

  return renderMessages(props)
    .join('')
    .replace(/src="\//g, `src="${auth.realm}/`);
};
