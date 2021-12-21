/* @flow strict-local */
import type { GetText, Narrow, MessageListElement } from '../../types';
import { ensureUnreachable } from '../../generics';
import type { BackgroundData } from '../MessageList';

import message from './message';
import header from './header';
import time from './time';

export default ({
  backgroundData,
  narrow,
  element,
  _,
}: {|
  backgroundData: BackgroundData,
  narrow: Narrow,
  element: MessageListElement,
  _: GetText,
|}): string => {
  switch (element.type) {
    case 'time':
      return time(element);
    case 'header':
      return header(backgroundData, element);
    case 'message':
      return message(backgroundData, element, _);
    default:
      ensureUnreachable(element);
      throw new Error(`Unidentified element.type: '${element.type}'`);
  }
};
