/* @flow */
import React from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import TaggedView from '../native/TaggedView';
import { LoadingIndicator } from '../common';
import MessageTyping from '../message/MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import renderMessages from './renderMessages';
import {
  constructActionButtons,
  executeActionSheetAction,
  constructHeaderActionButtons,
} from './messageActionSheet';

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

  handleHeaderLongPress = item => {
    const { subscriptions, mute, doNarrow, auth } = this.props;
    const options = constructHeaderActionButtons({ item, subscriptions, mute });
    const callback = buttonIndex => {
      executeActionSheetAction({
        title: options[buttonIndex],
        message: item,
        header: true,
        doNarrow,
        auth,
        subscriptions
      });
    };
    this.showActionSheet({ options, cancelButtonIndex: options.length - 1, callback });
  };

  showActionSheet = ({ options, cancelButtonIndex, callback }) => {
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      callback,
    );
  };

  handleLongPress = message => {
    const { auth, narrow, subscriptions, mute, flags, doNarrow } = this.props;
    const options = constructActionButtons({ message, auth, narrow, subscriptions, mute, flags });
    const callback = buttonIndex => {
      executeActionSheetAction({
        title: options[buttonIndex],
        message,
        doNarrow,
        auth,
        subscriptions
      });
    };
    this.showActionSheet({ options, cancelButtonIndex: options.length - 1, callback });
  };

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
      auth,
      subscriptions,
      users,
      messages,
      narrow,
      mute,
      doNarrow,
      flags,
      twentyFourHourTime,
    } = this.props;

    const messageList = renderMessages({
      onLongPress: this.handleLongPress,
      onHeaderLongPress: this.handleHeaderLongPress,
      auth,
      subscriptions,
      users,
      messages,
      narrow,
      mute,
      doNarrow,
      flags,
      pushRoute,
      twentyFourHourTime,
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
