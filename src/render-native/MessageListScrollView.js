/* @flow */
import React, { PureComponent } from 'react';

import type { Props } from '../message/MessageListContainer';
import { nullFunction } from '../nullObjects';
import { LoadingIndicator } from '../common';
import MessageTyping from './MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import cachedMessageRender from './cachedMessageRender';
import MessageListLoading from '../message/MessageListLoading';

export default class MessageListScrollView extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    onLongPress: nullFunction,
    onReplySelect: nullFunction,
    onScroll: nullFunction,
  };

  render() {
    const { styles } = this.context;
    const {
      anchor,
      actions,
      showMessagePlaceholders,
      fetching,
      listRef,
      onLongPress,
      onScroll,
      typingUsers,
      renderedMessages,
      narrow,
    } = this.props;

    if (showMessagePlaceholders) {
      return <MessageListLoading />;
    }

    const { messageList, stickyHeaderIndices } = cachedMessageRender(
      narrow,
      renderedMessages,
      onLongPress,
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
        <LoadingIndicator active={fetching.older} backgroundColor={styles.backgroundColor} />
        {messageList}
        {fetching.newer && <LoadingIndicator active backgroundColor={styles.backgroundColor} />}
        {typingUsers && <MessageTyping users={typingUsers} actions={actions} />}
      </InfiniteScrollView>
    );
  }
}
