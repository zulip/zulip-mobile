/* @flow */
import React, { PureComponent } from 'react';

import connectWithActions from '../connectWithActions';
import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import {
  getActiveNarrow,
  getApp,
  getCurrentRealm,
  getStreams,
  getSubscriptions,
  getUsers,
} from '../selectors';

import type { Message, Narrow } from '../types';
import TitleHome from './TitleHome';
import TitlePrivate from './TitlePrivateContainer';
import TitleGroup from './TitleGroupContainer';
import TitleSpecial from './TitleSpecialContainer';
import TitleStream from './TitleStreamContainer';
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
    const titleType = titles.find(x => x.isFunc(narrow));
    if (editMessage != null) {
      return <TitlePlain text="Edit message" color={color} />;
    }
    if (!titleType) return null;

    return <titleType.component color={color} />;
  }
}

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
  narrow: getActiveNarrow(state),
  users: getUsers(state),
  subscriptions: getSubscriptions(state),
  streams: getStreams(state),
  editMessage: getApp(state).editMessage,
}))(Title);
