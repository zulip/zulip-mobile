/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, TypingState } from '../types';
import { nullFunction } from '../nullObjects';
import { LoadingIndicator } from '../common';
import { shouldComponentUpdateWithDebug } from '../utils/debug';
import MessageTyping from '../message/MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import cachedMessageRender from './cachedMessageRender';

type Props = {
  actions: Actions,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  singleFetchProgress: boolean,
  typingUsers?: TypingState,
  listRef?: Object,
  renderedMessages: Object[],
  onScroll: () => void,
};

export default class MessageList extends PureComponent {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    onScroll: nullFunction,
  };

  render() {
    const { styles } = this.context;
    const {
      actions,
      fetchingOlder,
      fetchingNewer,
      singleFetchProgress,
      listRef,
      onScroll,
      typingUsers,
      renderedMessages,
    } = this.props;

    const { messageList, stickyHeaderIndices } = cachedMessageRender(renderedMessages);

    return (
      <InfiniteScrollView
        style={styles.messageList}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={stickyHeaderIndices}
        onStartReached={actions.fetchOlder}
        onEndReached={actions.fetchNewer}
        listRef={listRef}
        onScroll={onScroll}>
        <LoadingIndicator active={fetchingOlder} />
        {messageList}
        {!singleFetchProgress && fetchingNewer && <LoadingIndicator active />}
        {typingUsers && <MessageTyping users={typingUsers} actions={actions} />}
      </InfiniteScrollView>
    );
  }
}
