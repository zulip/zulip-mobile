/* @flow strict-local */
import type { GetText, MessageListElement } from '../../types';
import { ensureUnreachable } from '../../generics';
import type { BackgroundData } from '../backgroundData';

import message from './message';
import header from './header';
import time from './time';

export default ({
  backgroundData,
  element,
  _,
}: {|
  backgroundData: BackgroundData,
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
