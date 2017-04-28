import React from 'react';
import ActionSheet from 'react-native-actionsheet'; // eslint-disable-line

import styles from '../styles';
import TaggedView from '../native/TaggedView';
import { LoadingIndicator } from '../common';
import MessageTyping from '../message/MessageTyping';
import InfiniteScrollView from './InfiniteScrollView';
import renderMessages from './renderMessages';
import { actionSheetButtons, executeActionSheetAction } from './messageActionSheet';

export default class MessageList extends React.PureComponent {
  autoScrollToBottom = false;

  static defaultProps = {
    onScroll: () => {},
  };

  componentWillReceiveProps(nextProps) {
    this.autoScrollToBottom = this.props.caughtUp.newer && nextProps.caughtUp.newer;
  }

  handleLongPress = (message) => {
    this.messageLongPressed = message;
    this.actionSheet.show();
  }

  handleActionSheetPress = buttonIndex => {
    executeActionSheetAction({ buttonIndex, message: this.messageLongPressed, ...this.props });
  };

  render() {
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

    const messageList = renderMessages({ onLongPress: this.handleLongPress, ...this.props });

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
        <ActionSheet
          ref={(ac) => { this.actionSheet = ac; }}
          options={actionSheetButtons}
          onPress={this.handleActionSheetPress}
          cancelButtonIndex={actionSheetButtons.length - 1}
        />
      </InfiniteScrollView>
    );
  }
}
