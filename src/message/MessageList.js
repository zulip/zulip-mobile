/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, TypingState } from '../types';
import { nullFunction } from '../nullObjects';
import { LoadingIndicator } from '../common';
import MessageTyping from '../message/MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';

type Props = {
  actions: Actions,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  singleFetchProgress: boolean,
  typingUsers?: TypingState,
  listRef?: Object,
  renderedMessages: any[],
  onScroll: () => void,
};

export default class MessageList extends PureComponent {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  autoScrollToBottom = false;

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

    const messageList = React.Children.toArray([
      <LoadingIndicator active={fetchingOlder} />,
      renderedMessages.reduce(
        (result, section) =>
          result.push(
            <MessageListSection key={section.key} message={section.message} />,
            section.data.map(item => <MessageListItem {...item} />),
          ) && result,
        [],
      ),
      !singleFetchProgress && fetchingNewer && <LoadingIndicator active />,
      typingUsers && <MessageTyping users={typingUsers} actions={actions} />,
    ]);

    const stickyHeaderIndices = messageList.reduce((indices, component, idx) => {
      if (component.type === MessageListSection) {
        indices.push(idx);
      }
      return indices;
    }, []);
    console.log(
      '!!!!!!!!!!!!!!!!!!!!!!!!!!\n!!!!!!!!!!!!!!!!!!!!!!!!!!\n!!!!!!!!!!!!!!!!!!!!!!!!!!\n!!!!!!!!!!!!!!!!!!!!!!!!!!',
    );
    return (
      <InfiniteScrollView
        style={styles.messageList}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={stickyHeaderIndices}
        onStartReached={actions.fetchOlder}
        onEndReached={actions.fetchNewer}
        autoScrollToBottom={this.autoScrollToBottom}
        listRef={listRef}
        onScroll={onScroll}>
        {messageList}
      </InfiniteScrollView>
    );
  }
}
