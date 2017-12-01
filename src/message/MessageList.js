/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, TypingState, Narrow } from '../types';
import { nullFunction } from '../nullObjects';
import { LoadingIndicator } from '../common';
import MessageTyping from '../message/MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import cachedMessageRender from './cachedMessageRender';

type Props = {
  actions: Actions,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  singleFetchProgress?: boolean,
  renderedMessages: Object[],
  anchor?: number,
  narrow?: Narrow,
  typingUsers?: TypingState,
  listRef?: (component: any) => void,
  onReplySelect: () => void,
  onScroll: (e: Event) => void,
};

export default class MessageList extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    onReplySelect: nullFunction,
    onScroll: nullFunction,
  };

  render() {
    const { styles } = this.context;
    const {
      anchor,
      actions,
      fetchingOlder,
      fetchingNewer,
      singleFetchProgress,
      listRef,
      onReplySelect,
      onScroll,
      typingUsers,
      renderedMessages,
      narrow,
    } = this.props;

    const { messageList, stickyHeaderIndices } = cachedMessageRender(
      renderedMessages,
      onReplySelect,
    );

    return (
      <InfiniteScrollView
        style={[styles.flexed, styles.backgroundColor]}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={stickyHeaderIndices}
        onStartReached={actions.fetchOlder}
        onEndReached={actions.fetchNewer}
        listRef={listRef}
        onScroll={onScroll}
        narrow={narrow}
        anchor={anchor}
      >
        {fetchingOlder && <LoadingIndicator active backgroundColor={styles.backgroundColor} />}
        {messageList}
        {!singleFetchProgress &&
          fetchingNewer && <LoadingIndicator active backgroundColor={styles.backgroundColor} />}
        {typingUsers && <MessageTyping users={typingUsers} actions={actions} />}
      </InfiniteScrollView>
    );
  }
}
