/* @flow */
import type { RenderedSectionDescriptor } from '../../types';
import type { RenderContext } from './messageAsHtml';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';
import { getGravatarFromEmail } from '../../utils/avatar';

export default (
  renderContext: RenderContext,
  renderedMessages: RenderedSectionDescriptor[],
): string =>
  renderedMessages
    .reduce((list, section, index) => {
      list.push(messageHeaderAsHtml(renderContext, section.message));

      section.data.forEach((item, idx) => {
        if (item.type === 'time') {
          list.push(timeRowAsHtml(item.timestamp, item.firstMessage));
        } else {
          const { message } = item;
          list.push(
            messageAsHtml(renderContext, {
              id: message.id,
              isBrief: item.isBrief,
              fromName: message.sender_full_name,
              fromEmail: message.sender_email,
              content: message.match_content || message.content,
              timestamp: message.timestamp,
              avatarUrl: message.avatar_url || getGravatarFromEmail(message.sender_email),
              timeEdited: message.last_edit_timestamp,
              isOutbox: message.isOutbox,
              reactions: message.reactions,
            }),
          );
        }
      });

      return list;
    }, [])
    .join('');
