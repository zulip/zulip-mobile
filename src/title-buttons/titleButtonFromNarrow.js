/* @flow */
import type { Narrow } from '../types';
import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import InfoNavButtonStream from './InfoNavButtonStream';
import InfoNavButtonPrivate from './InfoNavButtonPrivate';
import InfoNavButtonGroup from './InfoNavButtonGroup';

const infoButtonHandlers = [
  { isFunc: isHomeNarrow, ButtonComponent: null },
  { isFunc: isSpecialNarrow, ButtonComponent: null },
  { isFunc: isStreamNarrow, ButtonComponent: InfoNavButtonStream },
  { isFunc: isTopicNarrow, ButtonComponent: InfoNavButtonStream },
  { isFunc: isPrivateNarrow, ButtonComponent: InfoNavButtonPrivate },
  { isFunc: isGroupNarrow, ButtonComponent: InfoNavButtonGroup },
];

const extraButtonHandlers = [
  { isFunc: isHomeNarrow, ButtonComponent: null },
  { isFunc: isSpecialNarrow, ButtonComponent: null },
  { isFunc: isStreamNarrow, ButtonComponent: null },
  { isFunc: isTopicNarrow, ButtonComponent: null },
  { isFunc: isPrivateNarrow, ButtonComponent: null },
  { isFunc: isGroupNarrow, ButtonComponent: null },
];

const getButton = (handlers: Object[], narrow: Narrow): ?Object => {
  const handler = handlers.find(x => x.isFunc(narrow));
  return handler && handler.ButtonComponent;
};

export const getInfoButtonFromNarrow = (narrow: Narrow): ?Object =>
  getButton(infoButtonHandlers, narrow);

export const getExtraButtonFromNarrow = (narrow: Narrow): ?Object =>
  getButton(extraButtonHandlers, narrow);
