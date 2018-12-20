/* @flow strict-local */

import React, { PureComponent } from 'react';

import { caseNarrow } from '../utils/narrow';

import type { Narrow } from '../types';
import TitleHome from './TitleHome';
import TitlePrivate from './TitlePrivate';
import TitleGroup from './TitleGroup';
import TitleSpecial from './TitleSpecial';
import TitleStream from './TitleStream';
import TitlePlain from './TitlePlain';

type Props = {|
  isEditMode: boolean,
  narrow: Narrow,
  color: string,
|};

export default class Title extends PureComponent<Props> {
  render() {
    const { narrow, color, isEditMode } = this.props;
    const props = { color };
    if (isEditMode) {
      return <TitlePlain text="Edit message" {...props} />;
    }
    return caseNarrow(narrow, {
      home: () => <TitleHome color={color} />,
      starred: () => <TitleSpecial narrow={narrow} {...props} />,
      mentioned: () => <TitleSpecial narrow={narrow} {...props} />,
      allPrivate: () => <TitleSpecial narrow={narrow} {...props} />,
      stream: () => <TitleStream narrow={narrow} {...props} />,
      topic: () => <TitleStream narrow={narrow} {...props} />,
      pm: email => <TitlePrivate email={email} {...props} />,
      groupPm: () => <TitleGroup narrow={narrow} {...props} />,
      search: () => null,
    });
  }
}
