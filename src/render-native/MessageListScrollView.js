/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, TypingState, Narrow } from '../types';
import { nullFunction } from '../nullObjects';
import { LoadingIndicator } from '../common';
import MessageTyping from './MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import cachedMessageRender from './cachedMessageRender';
import MessageListLoading from '../message/MessageListLoading';

type Props = {
  actions: Actions,
  isFetching: boolean,
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

export default class MessageListScrollView extends PureComponent<Props> {
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
      isFetching,
      fetchingOlder,
      fetchingNewer,
      singleFetchProgress,
      listRef,
      messages,
      onReplySelect,
      onScroll,
      typingUsers,
      renderedMessages,
      narrow,
    } = this.props;

    if (isFetching && messages.length === 0) {
      return <MessageListLoading />;
    }

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
        <LoadingIndicator active={fetchingOlder} backgroundColor={styles.backgroundColor} />
        {messageList}
        {!singleFetchProgress &&
          fetchingNewer && <LoadingIndicator active backgroundColor={styles.backgroundColor} />}
        {typingUsers && <MessageTyping users={typingUsers} actions={actions} />}
      </InfiniteScrollView>
    );
  }
}
