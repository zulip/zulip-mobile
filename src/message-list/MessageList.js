import React from 'react';
import { StyleSheet } from 'react-native';

import InfiniteScrollView from './InfiniteScrollView';
import renderMessages from './renderMessages';

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-around',
  }
});

export default class MessageList extends React.PureComponent {
  render() {
    const { fetchOlder } = this.props;

    const {
      messageList,
      headerIndices,
      anchorIndices
    } = renderMessages(this.props);

    return (
      <InfiniteScrollView
        style={styles.list}
        contentContainerStyle={styles.container}
        automaticallyAdjustContentInset="false"
        autoScrollToBottom
        stickyHeaderIndices={headerIndices}
        anchorIndices={anchorIndices}
        onStartReached={fetchOlder}
        onScroll={e => {}}
      >
        {messageList}
      </InfiniteScrollView>
    );
  }
}
