/* @flow strict-local */
import type { Narrow, RenderedSectionDescriptor } from '../../types';
import type { BackgroundData } from '../MessageList';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';

export default (
  backgroundData: BackgroundData,
  narrow: Narrow,
  renderedMessages: RenderedSectionDescriptor[],
): string => {
  const pieces = [];
  renderedMessages.forEach(section => {
    pieces.push(messageHeaderAsHtml(backgroundData, narrow, section.message));
    section.data.forEach(item => {
      if (item.type === 'time') {
        pieces.push(timeRowAsHtml(item.timestamp, item.firstMessage));
      } else {
        pieces.push(messageAsHtml(backgroundData, item.message, item.isBrief));
      }
    });
  });
  return pieces.join('');
};
