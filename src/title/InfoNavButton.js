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
import {
  getActiveNarrow,
  getCurrentRealm,
  getRecipientsInGroupNarrow,
  getStreams,
  getTitleTextColor,
} from '../selectors';
import NavButton from '../nav/NavButton';
import NavButtonPlaceholder from '../nav/NavButtonPlaceholder';

type Props = {
  actions: Actions,
  narrow: Narrow,
  color: string,
  recipients: string[],
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

  handleGroupInfo = () => {
    const { actions, recipients } = this.props;
    actions.navigateToGroupDetails(recipients);
  };

  render() {
    const { narrow, color } = this.props;

    const handlers = [
      { isFunc: isHomeNarrow, handlerFunc: null },
      { isFunc: isSpecialNarrow, handlerFunc: null },
      { isFunc: isStreamNarrow, handlerFunc: this.handleStreamInfo },
      { isFunc: isTopicNarrow, handlerFunc: this.handleStreamInfo },
      { isFunc: isPrivateNarrow, handlerFunc: this.handlePrivateInfo },
      { isFunc: isGroupNarrow, handlerFunc: this.handleGroupInfo },
    ];
    const pressHandler = handlers.find(x => x.isFunc(narrow));

    if (!pressHandler || !pressHandler.handlerFunc) return <NavButtonPlaceholder />;

    return <NavButton name="info" color={color} onPress={pressHandler.handlerFunc} />;
  }
}

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
  narrow: getActiveNarrow(state),
  streams: getStreams(state),
  color: getTitleTextColor(state),
  recipients: getRecipientsInGroupNarrow(state),
}))(InfoNavButton);
