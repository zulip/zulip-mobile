/* @flow strict-local */

import type { Narrow, PieceDescriptor } from '../types';
import type { BackgroundData } from './MessageList';
import type { WebViewInboundEventEditSequence } from './generateInboundEvents';
import messageAsHtml from './html/messageAsHtml';
import messageHeaderAsHtml from './html/messageHeaderAsHtml';
import timeRowAsHtml from './html/timeRowAsHtml';
import { ensureUnreachable } from '../types';

export type Insert = {|
  type: 'insert',
  html: string,
  index: number,
|};

export type Delete = {|
  type: 'delete',
  index: number,
|};

export type Replace = {|
  type: 'replace',
  html: string,
  index: number,
|};

type Edit = Insert | Delete | Replace;

export type EditSequence = Edit[];

type HtmlItem = {
  messageId: number,
  type: 'time' | 'header' | 'message',
  html: string,
};

const getHtmlItemsFromPieceDescriptors = (args: {
  backgroundData: BackgroundData,
  narrow: Narrow,
  pieceDescriptors: PieceDescriptor[],
}): HtmlItem[] => {
  const { backgroundData, narrow, pieceDescriptors } = args;
  return pieceDescriptors.map(pieceDescriptor => {
    switch (pieceDescriptor.type) {
      case 'time':
        return {
          messageId: pieceDescriptor.subsequentMessage.id,
          type: 'time',
          html: timeRowAsHtml(pieceDescriptor.timestamp, pieceDescriptor.subsequentMessage),
        };
      case 'header':
        return {
          messageId: pieceDescriptor.subsequentMessage.id,
          type: 'header',
          html: messageHeaderAsHtml(backgroundData, narrow, pieceDescriptor.subsequentMessage),
        };
      case 'message':
        return {
          messageId: pieceDescriptor.message.id,
          type: 'message',
          html: messageAsHtml(backgroundData, pieceDescriptor.message, pieceDescriptor.isBrief),
        };
      default:
        throw new Error(`Unidentified pieceDescriptor.type: '${pieceDescriptor.type}'`);
    }
  });
};

const compare = (oldHtmlItem: HtmlItem, newHtmlItem: HtmlItem): '<' | '=' | '>' => {
  let result: '<' | '=' | '>' = '=';
  if (oldHtmlItem.messageId < newHtmlItem.messageId) {
    result = '<';
  }
  if (oldHtmlItem.messageId > newHtmlItem.messageId) {
    result = '>';
  }
  if (oldHtmlItem.messageId === newHtmlItem.messageId) {
    const typeToOrder = {
      time: 0,
      header: 1,
      message: 2,
    };
    const oldItemOrder = typeToOrder[oldHtmlItem.type];
    const newItemOrder = typeToOrder[newHtmlItem.type];
    if (oldItemOrder < newItemOrder) {
      result = '<';
    }
    if (oldItemOrder > newItemOrder) {
      result = '>';
    }
    if (oldItemOrder === newItemOrder) {
      result = '=';
    }
  }
  return result;
};

export const getEditSequence = (
  oldHtmlItems: HtmlItem[],
  newHtmlItems: HtmlItem[],
): EditSequence => {
  const isOrderedByMessageId = (array: HtmlItem[]) =>
    array.every((htmlItem, i) => i === 0 || array[i].messageId >= array[i - 1].messageId);
  if (!isOrderedByMessageId(oldHtmlItems) || !isOrderedByMessageId(newHtmlItems)) {
    throw new Error('Not ordered');
  }

  const editSequence: EditSequence = [];

  let x = 0;
  let y = 0;
  while (x < oldHtmlItems.length && y < newHtmlItems.length) {
    const oldItem = oldHtmlItems[x];
    const newItem = newHtmlItems[y];
    const compareResult = compare(oldItem, newItem);
    switch (compareResult) {
      case '<': {
        editSequence.push({ type: 'delete', index: y });
        x++;
        break;
      }
      case '>': {
        editSequence.push({ type: 'insert', index: y, html: newItem.html });
        y++;
        break;
      }
      case '=': {
        if (oldItem.html !== newItem.html) {
          editSequence.push({ type: 'replace', index: y, html: newItem.html });
        }
        x++;
        y++;
        break;
      }
      default: {
        ensureUnreachable(compareResult);
        throw new Error(`Unexpected compareResult ${compareResult}`);
      }
    }
  }

  while (y < newHtmlItems.length) {
    const newItem = newHtmlItems[y];
    editSequence.push({ type: 'insert', index: y, html: newItem.html });
    y++;
  }

  while (x < oldHtmlItems.length) {
    editSequence.push({ type: 'delete', index: y });
    x++;
  }

  return editSequence;
};

export default (
  prevArgs: {
    backgroundData: BackgroundData,
    narrow: Narrow,
    pieceDescriptors: PieceDescriptor[],
  },
  currArgs: {
    backgroundData: BackgroundData,
    narrow: Narrow,
    pieceDescriptors: PieceDescriptor[],
  },
  initialScrollMessageId: number | null,
): WebViewInboundEventEditSequence => {
  const [oldHtmlItems, newHtmlItems] = [prevArgs, currArgs].map(getHtmlItemsFromPieceDescriptors);
  return {
    type: 'edit-sequence',
    sequence: getEditSequence(oldHtmlItems, newHtmlItems),
    initialScrollMessageId,
  };
};
