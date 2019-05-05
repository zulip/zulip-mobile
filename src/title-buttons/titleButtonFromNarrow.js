/* @flow strict-local */
import React from 'react';
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

type Props = {| color: string, narrow: Narrow |};
type NarrowNavButton = ComponentType<Props>;
type NarrowNavButtonCandidate = {|
  isFunc: Narrow => boolean,
  ButtonComponent: NarrowNavButton | null,
|};

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

const makeButton = (handlers): NarrowNavButton => props => {
  const handler = handlers.find(x => x.isFunc(props.narrow)) || null;
  const SpecificButton = handler && handler.ButtonComponent;
  return !!SpecificButton && <SpecificButton {...props} />;
};

export const InfoButton = makeButton(infoButtonHandlers);

export const ExtraButton = makeButton(extraButtonHandlers);
