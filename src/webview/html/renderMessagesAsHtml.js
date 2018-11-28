/* @flow */
import type { Narrow, RenderedSectionDescriptor } from '../../types';
import type { BackgroundData } from '../MessageList';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';

export default (
  backgroundData: BackgroundData,
  narrow: Narrow,
  renderedMessages: RenderedSectionDescriptor[],
): string =>
  renderedMessages
    .reduce((list, section, index) => {
      list.push(messageHeaderAsHtml(backgroundData, narrow, section.message));

      section.data.forEach((item, idx) => {
        if (item.type === 'time') {
          list.push(timeRowAsHtml(item.timestamp, item.firstMessage));
        } else {
          const { message } = item;
          list.push(messageAsHtml(backgroundData, message, item.isBrief));
        }
      });

      return list;
    }, [])
    .join('');
