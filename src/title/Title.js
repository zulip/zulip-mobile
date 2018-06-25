/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import { getSession } from '../selectors';

import type { Message, GlobalState, Narrow } from '../types';
import TitleHome from './TitleHome';
import TitlePrivate from './TitlePrivate';
import TitleGroup from './TitleGroup';
import TitleSpecial from './TitleSpecial';
import TitleStream from './TitleStream';
import TitlePlain from './TitlePlain';

const titles = [
  { isFunc: isHomeNarrow, component: TitleHome },
  { isFunc: isSpecialNarrow, component: TitleSpecial },
  { isFunc: isStreamNarrow, component: TitleStream },
  { isFunc: isTopicNarrow, component: TitleStream },
  { isFunc: isPrivateNarrow, component: TitlePrivate },
  { isFunc: isGroupNarrow, component: TitleGroup },
];

type Props = {
  narrow: Narrow,
  editMessage: Message,
  color: string,
};

class Title extends PureComponent<Props> {
  props: Props;

  render() {
    const { narrow, editMessage, color } = this.props;

    if (editMessage != null) {
      return <TitlePlain text="Edit message" color={color} />;
    }

    const titleType = narrow && titles.find(x => x.isFunc(narrow));

    if (!titleType) {
      return null;
    }

    return <titleType.component color={color} narrow={narrow} />;
  }
}

export default connect((state: GlobalState) => ({
  editMessage: getSession(state).editMessage,
}))(Title);
