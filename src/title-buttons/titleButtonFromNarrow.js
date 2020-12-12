/* @flow strict-local */
import React from 'react';
import type { ComponentType } from 'react';

import type { Narrow } from '../types';
import { caseNarrowDefault } from '../utils/narrow';
import InfoNavButtonStream from './InfoNavButtonStream';
import InfoNavButtonPrivate from './InfoNavButtonPrivate';
import InfoNavButtonGroup from './InfoNavButtonGroup';
import ExtraNavButtonStream from './ExtraNavButtonStream';
import ExtraNavButtonTopic from './ExtraNavButtonTopic';

type Props = $ReadOnly<{| color: string, narrow: Narrow |}>;

export const InfoButton: ComponentType<Props> = props =>
  caseNarrowDefault(
    props.narrow,
    {
      stream: streamName => <InfoNavButtonStream {...props} />,
      topic: (streamName, topic) => <InfoNavButtonStream {...props} />,
      pm: (emails, ids) =>
        ids.length === 1 ? <InfoNavButtonPrivate {...props} /> : <InfoNavButtonGroup {...props} />,
    },
    () => false,
  );

export const ExtraButton: ComponentType<Props> = props =>
  caseNarrowDefault(
    props.narrow,
    {
      stream: streamName => <ExtraNavButtonStream {...props} />,
      topic: (streamName, topic) => <ExtraNavButtonTopic {...props} />,
    },
    () => false,
  );
