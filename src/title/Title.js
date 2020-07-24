/* @flow strict-local */

import React, { PureComponent } from 'react';

import { caseNarrow } from '../utils/narrow';

import type { Narrow } from '../types';
import TitlePrivate from './TitlePrivate';
import TitleGroup from './TitleGroup';
import TitleSpecial from './TitleSpecial';
import TitleStream from './TitleStream';

type Props = $ReadOnly<{|
  narrow: Narrow,
  color: string,
|}>;

export default class Title extends PureComponent<Props> {
  render() {
    const { narrow, color } = this.props;

    return caseNarrow(narrow, {
      home: () => <TitleSpecial code="home" color={color} />,
      starred: () => <TitleSpecial code="starred" color={color} />,
      mentioned: () => <TitleSpecial code="mentioned" color={color} />,
      allPrivate: () => <TitleSpecial code="private" color={color} />,
      stream: () => <TitleStream narrow={narrow} color={color} />,
      topic: () => <TitleStream narrow={narrow} color={color} />,
      pm: email => <TitlePrivate email={email} color={color} />,
      groupPm: () => <TitleGroup narrow={narrow} />,
      search: () => null,
    });
  }
}
