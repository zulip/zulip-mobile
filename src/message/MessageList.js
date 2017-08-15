/* @flow */
import React, { PureComponent } from 'react';

import TaggedView from '../native/TaggedView';
import { nullFunction } from '../nullObjects';
import { LoadingIndicator } from '../common';
import MessageTyping from '../message/MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import type { Actions, TypingState } from '../types';

type Props = {
  actions: Actions,
  caughtUpNewer: boolean,
  caughtUpOlder: boolean,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  singleFetchProgress: boolean,
  onScroll: () => void,
  typingUsers?: TypingState,
  renderedMessages: any[],
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

  componentWillReceiveProps(nextProps: Props) {
    this.autoScrollToBottom = this.props.caughtUpNewer && nextProps.caughtUpNewer;
  }

  render() {
    const { styles } = this.context;
    const {
      actions,
      caughtUpOlder,
      fetchingOlder,
      fetchingNewer,
      singleFetchProgress,
      onScroll,
      typingUsers,
      renderedMessages,
    } = this.props;

    // `headerIndices` tell the scroll view which components are headers
    // and are eligible to be docked at the top of the view.
    const headerIndices = [];
    for (let i = 0; i < renderedMessages.length; i++) {
      const elem = renderedMessages[i];
      if (elem.props.type === 'header') {
        headerIndices.push(i + 1);
      }
      if (elem.props.type === 'message') {
        renderedMessages[i] = (
          <TaggedView
            key={elem.props.message.id}
            tagID={elem.props.message.id.toString()}
            collapsable={false}>
            {elem}
          </TaggedView>
        );
      }
    }

    return (
      <InfiniteScrollView
        style={styles.messageList}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={[]}
        onStartReached={actions.fetchOlder}
        onEndReached={actions.fetchNewer}
        autoScrollToBottom={this.autoScrollToBottom}
        onScroll={onScroll}>
        <LoadingIndicator active={fetchingOlder} caughtUp={caughtUpOlder} />
        {renderedMessages}
        {!singleFetchProgress && fetchingNewer && <LoadingIndicator active />}
        {typingUsers && <MessageTyping users={typingUsers} actions={actions} />}
      </InfiniteScrollView>
    );
  }
}
