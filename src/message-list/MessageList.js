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
    justifyContent: 'flex-end',
  }
});

export default class MessageList extends React.PureComponent {
  render() {
    const { caughtUp, fetchOlder, fetchNewer } = this.props;

    const messageList = renderMessages(this.props);
    const headerIndices = messageList
      .map((x, idx) => ({ type: x.type.name, index: idx }))
      .filter(x => x.type === 'MessageHeader')
      .map(x => x.index);

    return (
      <InfiniteScrollView
        style={styles.list}
        contentContainerStyle={styles.container}
        automaticallyAdjustContentInset="false"
        autoScrollToBottom={caughtUp}
        stickyHeaderIndices={headerIndices}
        onStartReached={fetchOlder}
        onEndReached={fetchNewer}
        onScroll={e => {}}
      >
        {messageList}
      </InfiniteScrollView>
    );
  }
}
