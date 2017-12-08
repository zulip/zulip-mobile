/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Narrow, Stream } from '../types';
import connectWithActions from '../connectWithActions';
import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import { getCurrentRealm } from '../selectors';
import NavButton from '../nav/NavButton';
import NavButtonPlaceholder from '../nav/NavButtonPlaceholder';

type Props = {
  actions: Actions,
  narrow: Narrow,
  color: string,
  streams: Stream[],
};

class InfoNavButton extends PureComponent<Props> {
  props: Props;

  handleStreamInfo = () => {
    const { actions, narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      actions.navigateToStream(stream.stream_id);
    }
  };

  handlePrivateInfo = () => {
    const { actions, narrow } = this.props;
    actions.navigateToAccountDetails(narrow[0].operand);
  };

  render() {
    const { narrow, color } = this.props;

    const handlers = [
      { isFunc: isHomeNarrow, handlerFunc: null },
      { isFunc: isSpecialNarrow, handlerFunc: null },
      { isFunc: isStreamNarrow, handlerFunc: this.handleStreamInfo },
      { isFunc: isTopicNarrow, handlerFunc: this.handleStreamInfo },
      { isFunc: isPrivateNarrow, handlerFunc: this.handlePrivateInfo },
      { isFunc: isGroupNarrow, handlerFunc: null }, // TODO: show user list
    ];
    const pressHandler = handlers.find(x => x.isFunc(narrow));

    if (!pressHandler || !pressHandler.handlerFunc) return <NavButtonPlaceholder />;

    return <NavButton name="info" color={color} onPress={pressHandler.handlerFunc} />;
  }
}

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
  narrow: state.chat.narrow,
  users: state.users,
  subscriptions: state.subscriptions,
  streams: state.streams,
}))(InfoNavButton);
