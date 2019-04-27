/* @flow strict-local */

import React, { PureComponent } from 'react';

import { caseNarrow } from '../utils/narrow';
import { getSession } from '../selectors';

import type { EditMessage, Narrow, InjectedDispatch } from '../types';
import { connect } from '../react-redux';
import TitlePrivate from './TitlePrivate';
import TitleGroup from './TitleGroup';
import TitleSpecial from './TitleSpecial';
import TitleStream from './TitleStream';
import TitlePlain from './TitlePlain';

type OwnProps = {|
  narrow: Narrow,
  color: string,
|};

type SelectorProps = {|
  editMessage: ?EditMessage,
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
|};

class Title extends PureComponent<Props> {
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
      pm: email => <TitlePrivate email={email} color={color} />,
      groupPm: () => <TitleGroup narrow={narrow} />,
      search: () => null,
    });
  }
}

export default connect(state => ({
  editMessage: getSession(state).editMessage,
}))(Title);
