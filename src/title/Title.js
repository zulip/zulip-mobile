import React from 'react';
import { connect } from 'react-redux';

import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import { getAuth } from '../account/accountSelectors';

import TitleHome from './TitleHome';
import TitlePrivate from './TitlePrivate';
import TitleGroup from './TitleGroup';
import TitleSpecial from './TitleSpecial';
import TitleStream from './TitleStream';

const titles = [
  { isFunc: isHomeNarrow, component: TitleHome },
  { isFunc: isSpecialNarrow, component: TitleSpecial },
  { isFunc: isStreamNarrow, component: TitleStream },
  { isFunc: isTopicNarrow, component: TitleStream },
  { isFunc: isPrivateNarrow, component: TitlePrivate },
  { isFunc: isGroupNarrow, component: TitleGroup },
];

class Title extends React.PureComponent {
  render() {
    const { narrow } = this.props;
    const titleType = titles.find(x => x.isFunc(narrow));

    if (!titleType) return null;

    return <titleType.component {...this.props} />;
  }
}

export default connect(
  (state) => ({
    realm: getAuth(state).realm,
    narrow: state.chat.narrow,
    users: state.users,
    subscriptions: state.subscriptions,
  })
)(Title);
