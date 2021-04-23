/* @flow strict-local */
import type { Narrow, HtmlPieceDescriptor } from '../../types';
import type { BackgroundData } from '../MessageList';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';

export default ({
  backgroundData,
  narrow,
  htmlPieceDescriptors,
}: {|
  backgroundData: BackgroundData,
  narrow: Narrow,
  htmlPieceDescriptors: HtmlPieceDescriptor[],
|}): string => {
  const pieces = [];
  htmlPieceDescriptors.forEach(section => {
    if (section.message !== null) {
      pieces.push(messageHeaderAsHtml(backgroundData, narrow, section.message));
    }
    section.data.forEach(item => {
      if (item.type === 'time') {
        pieces.push(timeRowAsHtml(item.timestamp, item.subsequentMessage));
      } else {
        pieces.push(messageAsHtml(backgroundData, item.message, item.isBrief));
      }
    });
  });
  return pieces.join('');
};
