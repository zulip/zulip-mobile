import { getFullUrl } from '../../utils/url';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';

export default ({ auth, subscriptions, renderedMessages, narrow, doNarrow }) =>
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
        list.push(timeRowAsHtml(item.timestamp));
      } else {
        list.push(
          messageAsHtml({
            id: item.message.id,
            isBrief: item.isBrief,
            fromName: item.message.sender_full_name,
            fromEmail: item.message.sender_email,
            content: item.message.content,
            timestamp: item.message.timestamp,
            avatarUrl: getFullUrl(item.message.avatar_url, auth ? auth.realm : ''),
            timeEdited: item.message.last_edit_timestamp,
            isOutbox: item.message.isOutbox,
            isStarred: (item.message.flags || []).indexOf('starred') > -1,
            reactions: item.message.reactions,
            ownEmail: auth.email,
          }),
        );
      }
    });

    return list; // eslint-disable-next-line
  }, []);
