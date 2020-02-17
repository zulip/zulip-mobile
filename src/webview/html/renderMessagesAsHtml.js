/* @flow strict-local */
import type { Narrow, PieceDescriptor } from '../../types';
import type { BackgroundData } from '../MessageList';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';

export default (
  backgroundData: BackgroundData,
  narrow: Narrow,
  renderedMessages: PieceDescriptor[],
): string =>
  renderedMessages
    .map(pieceDescriptor => {
      switch (pieceDescriptor.type) {
        case 'time':
          return timeRowAsHtml(pieceDescriptor.timestamp, pieceDescriptor.subsequentMessage);
        case 'header':
          return messageHeaderAsHtml(backgroundData, narrow, pieceDescriptor.subsequentMessage);
        case 'message':
          return messageAsHtml(backgroundData, pieceDescriptor.message, pieceDescriptor.isBrief);
        default:
          throw new Error(`Unidentified pieceDescriptor.type: '${pieceDescriptor.type}'`);
      }
    })
    .join('');
