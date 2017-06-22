/* @flow */
import React from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import TaggedView from '../native/TaggedView';
import { LoadingIndicator } from '../common';
import MessageTyping from '../message/MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import renderMessages from './renderMessages';
import { constructActionButtons, executeActionSheetAction } from './messageActionSheet';

class MessageList extends React.PureComponent {

  static contextTypes = {
    styles: () => null,
  };

  autoScrollToBottom = false;

  static defaultProps = {
    onScroll: () => {},
  };

  componentWillReceiveProps(nextProps) {
    this.autoScrollToBottom = this.props.caughtUp.newer && nextProps.caughtUp.newer;
  }

  handleLongPress = (message) => {
    const { auth, narrow, subscriptions, mute, flags } = this.props;
    const options = constructActionButtons({ message, auth, narrow, subscriptions, mute, flags });
    const cancelButtonIndex = options.length - 1;

    this.props.showActionSheetWithOptions({
      options,
      cancelButtonIndex,
    },
      (buttonIndex) => {
        executeActionSheetAction({
          title: options[buttonIndex],
          message,
          ...this.props
        });
      });
  }

  render() {
    const { styles } = this.context;
    const {
      caughtUp,
      fetching,
      fetchOlder,
      fetchNewer,
      pushRoute,
      singleFetchProgress,
      onScroll,
      typingUsers,
    } = this.props;

    const messageList = renderMessages({
      onLongPress: this.handleLongPress,
      ...this.props,
    });

    // `headerIndices` tell the scroll view which components are headers
    // and are eligible to be docked at the top of the view.
    const headerIndices = [];
    for (let i = 0; i < messageList.length; i++) {
      const elem = messageList[i];
      if (elem.props.type === 'header') {
        headerIndices.push(i + 1);
      }
      if (elem.props.type === 'message') {
        messageList[i] = (
          <TaggedView
            key={elem.props.message.id}
            tagID={elem.props.message.id.toString()}
            collapsable={false}
          >
            {elem}
          </TaggedView>
        );
      }
    }

    return (
      <InfiniteScrollView
        style={styles.messageList}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={headerIndices}
        onStartReached={fetchOlder}
        onEndReached={fetchNewer}
        autoScrollToBottom={this.autoScrollToBottom}
        onScroll={onScroll}
      >
        <LoadingIndicator active={fetching.older} caughtUp={caughtUp.older} />
        {messageList}
        {!singleFetchProgress && fetching.newer && <LoadingIndicator active />}
        {typingUsers && <MessageTyping users={typingUsers} pushRoute={pushRoute} />}
      </InfiniteScrollView>
    );
  }
}

export default connectActionSheet(MessageList);
