import React from 'react';
import { StyleSheet } from 'react-native';

import { LoadingIndicator } from '../common';
import MessageLoading from '../message/MessageLoading';

import InfiniteScrollView from './InfiniteScrollView';
import renderMessages from './renderMessages';

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
});

export default class MessageList extends React.PureComponent {
  constructor() {
    super();
    this.mapIdToIdx = {};
  }

  componentWillReceiveProps(nextProps) {
    const currentNarrow = JSON.stringify(this.props.narrow);
    const nextNarrow = JSON.stringify(nextProps.narrow);

    // Invalidate the existing message anchors if the narrow changes
    // (because we'll have a brand new set of messages)
    if (currentNarrow !== nextNarrow) {
      this.mapIdToIdx = {};
    }
  }

  render() {
    const { messages, caughtUp, fetching, fetchOlder, fetchNewer } = this.props;
    let messageList = [];
    let containerStyle = {};

    if (messages.length === 0) {
      if (!caughtUp.older || !caughtUp.newer) {
        // Show placeholder messages if we're loading the screen
        messageList = [...Array(6).keys()].map((i) =>
          <MessageLoading key={`ml${i}`} />
        );
      }
      containerStyle = styles.centerContainer;
    } else {
      messageList = [
        <LoadingIndicator key={'top_loading'} active={fetching.older} />,
        ...renderMessages(this.props),
      ];
      if (fetching.newer) {
        messageList.push(<LoadingIndicator key={'bottom_loading'} active />);
      }
    }

    // `headerIndices` tell the scroll view which components are headers
    // and are eligible to be docked at the top of the view.
    const headerIndices = [];

    // `anchorIndices` tell the scroll view which components are messages
    // and are eligible to be used as anchors to maintain scroll position
    // if data changes or new data is added.
    //
    // `anchorMap` provides a map from old anchor indices to new anchor indices.
    // The scroll view needs to know how to find old anchors when state changes.
    //
    // `mapIdToIdx` is an internal map of messageId to index in the component
    // list and is used by `MessageList` to generate `anchorMap`.
    const anchorIndices = [];
    const anchorMap = {};
    const mapIdToIdx = {};

    messageList.forEach((elem, idx) => {
      if (elem.props.type === 'header') {
        headerIndices.push(idx);
      } else if (elem.props.type === 'message') {
        const messageId = elem.props.id;
        mapIdToIdx[messageId] = idx;
        anchorIndices.push(idx);

        const oldIdx = this.mapIdToIdx[messageId];
        if (oldIdx) anchorMap[oldIdx] = idx;
      }
    });

    this.mapIdToIdx = mapIdToIdx;

    return (
      <InfiniteScrollView
        style={styles.list}
        contentContainerStyle={containerStyle}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={headerIndices}
        anchorIndices={anchorIndices}
        anchorMap={anchorMap}
        onStartReached={fetchOlder}
        onEndReached={fetchNewer}
        autoScrollToBottom={caughtUp.newer}
        onScroll={e => {}}
      >
        {messageList}
      </InfiniteScrollView>
    );
  }
}
