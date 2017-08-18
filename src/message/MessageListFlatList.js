/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import config from '../config';
import { nullFunction } from '../nullObjects';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';

export default class MessageList extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    fetchingOlder: boolean,
    fetchingNewer: boolean,
    listRef: (component: Object) => void,
  };

  static defaultProps = {
    onScroll: nullFunction,
  };

  render() {
    const { styles } = this.context;
    const { actions, renderedMessages, fetchingOlder, caughtUpOlder, listRef } = this.props;

    return (
      <SectionList
        style={styles.messageList}
        initialNumToRender={20}
        sections={renderedMessages}
        refreshing={fetchingOlder}
        // initialScrollIndex={123}
        removeClippedSubviews // potentially buggy
        renderSectionHeader={({ section }) => <MessageListSection {...section} />}
        renderItem={({ item }) => <MessageListItem {...item} />}
        keyExtractor={item => (item.type === 'time' ? `time${item.timestamp}` : item.message.id)}
        onStartReached={actions.fetchOlder}
        startReachedThreshold={config.startMessageListThreshold}
        onEndReached={actions.fetchNewer}
        endReachedThreshold={config.endMessageListThreshold}
        onRefresh={caughtUpOlder ? null : actions.fetchOlder}
        ref={component => {
          if (listRef) listRef(component);
        }}
      />
    );
  }
}
