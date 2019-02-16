/* @flow strict-local */
import type { ComponentType } from 'react';

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
import ExtraNavButtonStream from './ExtraNavButtonStream';
import ExtraNavButtonTopic from './ExtraNavButtonTopic';

type NarrowNavButton = ComponentType<{| color: string, narrow: Narrow |}>;
type NarrowNavButtonCandidate = {
  isFunc: Narrow => boolean,
  ButtonComponent: NarrowNavButton | null,
};

const infoButtonHandlers: NarrowNavButtonCandidate[] = [
  { isFunc: isHomeNarrow, ButtonComponent: null },
  { isFunc: isSpecialNarrow, ButtonComponent: null },
  { isFunc: isStreamNarrow, ButtonComponent: InfoNavButtonStream },
  { isFunc: isTopicNarrow, ButtonComponent: InfoNavButtonStream },
  { isFunc: isPrivateNarrow, ButtonComponent: InfoNavButtonPrivate },
  { isFunc: isGroupNarrow, ButtonComponent: InfoNavButtonGroup },
];

const extraButtonHandlers: NarrowNavButtonCandidate[] = [
  { isFunc: isHomeNarrow, ButtonComponent: null },
  { isFunc: isSpecialNarrow, ButtonComponent: null },
  { isFunc: isStreamNarrow, ButtonComponent: ExtraNavButtonStream },
  { isFunc: isTopicNarrow, ButtonComponent: ExtraNavButtonTopic },
  { isFunc: isPrivateNarrow, ButtonComponent: null },
  { isFunc: isGroupNarrow, ButtonComponent: null },
];

const getButton = (handlers, narrow): ?NarrowNavButton => {
  const handler = handlers.find(x => x.isFunc(narrow));
  return handler && handler.ButtonComponent;
};

export const getInfoButtonFromNarrow = (narrow: Narrow): ?NarrowNavButton =>
  getButton(infoButtonHandlers, narrow);

export const getExtraButtonFromNarrow = (narrow: Narrow): ?NarrowNavButton =>
  getButton(extraButtonHandlers, narrow);
