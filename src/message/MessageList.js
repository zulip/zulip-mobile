/* @flow */
import React, { PureComponent } from 'react';
import isEqual from 'lodash.isequal';

import type { Actions, TypingState } from '../types';
import { nullFunction } from '../nullObjects';
import { LoadingIndicator } from '../common';
import MessageTyping from '../message/MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import cachedMessageRender from './cachedMessageRender';

type Props = {
  actions: Actions,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  singleFetchProgress: boolean,
  typingUsers?: TypingState,
  listRef?: (component: any) => void,
  renderedMessages: Object[],
  onReplySelect: () => void,
  onScroll: (e: Event) => void,
};

export default class MessageList extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    onReplySelect: nullFunction,
    onScroll: nullFunction,
  };

  props: Props;
  listComponent: any;

  listRef = (component: Object) => {
    this.listComponent = component || this.listComponent;
    if (this.props.listRef) {
      this.props.listRef(component);
    }
  };

  componentWillReceiveProps(nextProps: Props) {
    console.log('EEEEEEE', this.props.narrow, nextProps.narrow);
    if (!isEqual(this.props.narrow, nextProps.narrow)) {
      console.log('OOOOOOOO');
      setTimeout(() => {
        //  this.listComponent.scrollToEnd();
      }, 300);
    }
  }

  handleContentChange = () => {
    console.log('WOWOW handleContentChange', this.listComponent);
    // this.listComponent.scrollToEnd();
    // setTimeout(() => {
    //   // this.listComponent.scrollToEnd();
    //   console.log('WOWOW post', this.listComponent);
    // }, 300);

    // this.listComponent.scrollToEnd();
  };

  render() {
    const { styles } = this.context;
    const {
      actions,
      fetchingOlder,
      fetchingNewer,
      singleFetchProgress,
      onReplySelect,
      onScroll,
      typingUsers,
      renderedMessages,
    } = this.props;

    const { messageList, stickyHeaderIndices } = cachedMessageRender(
      renderedMessages,
      onReplySelect,
    );

    return (
      <InfiniteScrollView
        style={styles.messageList}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={stickyHeaderIndices}
        onStartReached={actions.fetchOlder}
        onEndReached={actions.fetchNewer}
        onContentSizeChange={this.handleContentChange}
        listRef={this.listRef}
        onScroll={onScroll}
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
