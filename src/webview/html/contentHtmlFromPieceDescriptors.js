/* @flow strict-local */
import type { GetText, Narrow, HtmlPieceDescriptor } from '../../types';
import { ensureUnreachable } from '../../generics';
import type { BackgroundData } from '../MessageList';

import messageAsHtml from './messageAsHtml';
import messageHeaderAsHtml from './messageHeaderAsHtml';
import timeRowAsHtml from './timeRowAsHtml';

export default ({
  backgroundData,
  narrow,
  htmlPieceDescriptors,
  _,
}: {|
  backgroundData: BackgroundData,
  narrow: Narrow,
  htmlPieceDescriptors: $ReadOnlyArray<HtmlPieceDescriptor>,
  _: GetText,
|}): string =>
  htmlPieceDescriptors
    .map(pieceDescriptor => {
      switch (pieceDescriptor.type) {
        case 'time':
          return timeRowAsHtml(pieceDescriptor.timestamp, pieceDescriptor.subsequentMessage);
        case 'header':
          return messageHeaderAsHtml(backgroundData, narrow, pieceDescriptor.subsequentMessage);
        case 'message':
          return messageAsHtml(backgroundData, pieceDescriptor.message, pieceDescriptor.isBrief, _);
        default:
          ensureUnreachable(pieceDescriptor);
          throw new Error(`Unidentified pieceDescriptor.type: '${pieceDescriptor.type}'`);
      }
    })
    .join('');
