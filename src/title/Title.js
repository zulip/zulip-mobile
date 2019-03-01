/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import { caseNarrow } from '../utils/narrow';
import { getSession } from '../selectors';

import type { Message, GlobalState, Narrow } from '../types';
import TitleHome from './TitleHome';
import TitlePrivate from './TitlePrivate';
import TitleGroup from './TitleGroup';
import TitleSpecial from './TitleSpecial';
import TitleStream from './TitleStream';
import TitlePlain from './TitlePlain';

type Props = {|
  narrow: Narrow,
  editMessage: Message,
  color: string,
|};

class Title extends PureComponent<Props> {
  render() {
    const { narrow, color, editMessage } = this.props;
    const props = { color };
    if (editMessage != null) {
      return <TitlePlain text="Edit message" {...props} />;
    }
    return caseNarrow(narrow, {
      home: () => <TitleHome color={color} />,
      starred: () => <TitleSpecial code="starred" {...props} />,
      mentioned: () => <TitleSpecial code="mentioned" {...props} />,
      allPrivate: () => <TitleSpecial code="private" {...props} />,
      stream: () => <TitleStream narrow={narrow} {...props} />,
      topic: () => <TitleStream narrow={narrow} {...props} />,
      pm: email => <TitlePrivate email={email} {...props} />,
      groupPm: () => <TitleGroup narrow={narrow} {...props} />,
      search: () => null,
    });
  }
}

export default connect((state: GlobalState) => ({
  editMessage: getSession(state).editMessage,
}))(Title);
