/* @flow strict-local */

import React, { PureComponent } from 'react';

import { caseNarrow } from '../utils/narrow';

import type { Narrow, EditMessage } from '../types';
import TitlePrivate from './TitlePrivate';
import TitleGroup from './TitleGroup';
import TitleSpecial from './TitleSpecial';
import TitleStream from './TitleStream';
import TitlePlain from './TitlePlain';

type Props = $ReadOnly<{|
  narrow: Narrow,
  color: string,
  editMessage: EditMessage | null,
|}>;

export default class Title extends PureComponent<Props> {
  render() {
    const { narrow, color, editMessage } = this.props;
    if (editMessage != null) {
      return <TitlePlain text="Edit message" color={color} />;
    }
    return caseNarrow(narrow, {
      home: () => <TitleSpecial code="home" color={color} />,
      starred: () => <TitleSpecial code="starred" color={color} />,
      mentioned: () => <TitleSpecial code="mentioned" color={color} />,
      allPrivate: () => <TitleSpecial code="private" color={color} />,
      stream: () => <TitleStream narrow={narrow} color={color} />,
      topic: () => <TitleStream narrow={narrow} color={color} />,
      pm: emails =>
        emails.length === 1 ? (
          <TitlePrivate email={emails[0]} color={color} />
        ) : (
          <TitleGroup narrow={narrow} />
        ),
      search: () => null,
    });
  }
}
