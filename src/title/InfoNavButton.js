/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Narrow, Stream } from '../types';
import connectWithActions from '../connectWithActions';
import { ViewPlaceholder } from '../common';
import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import {
  getCurrentRealm,
  getRecipientsInGroupNarrow,
  getStreams,
  getTitleTextColor,
} from '../selectors';
import NavButton from '../nav/NavButton';

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

    if (!pressHandler || !pressHandler.handlerFunc) return <ViewPlaceholder width={44} />;

    return <NavButton name="info" color={color} onPress={pressHandler.handlerFunc} />;
  }
}

export default connectWithActions((state, props) => ({
  realm: getCurrentRealm(state),
  streams: getStreams(state),
  color: getTitleTextColor(props.narrow)(state),
  recipients: getRecipientsInGroupNarrow(props.narrow)(state),
}))(InfoNavButton);
