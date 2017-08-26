/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { Actions, TypingState } from '../types';
import { nullFunction } from '../nullObjects';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';

export default class MessageList extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    typingUsers?: TypingState,
    fetchingOlder: boolean,
    fetchingNewer: boolean,
    renderedMessages: Object[],
    listRef: (component: Object) => void,
  };

  static defaultProps = {
    onScroll: nullFunction,
  };

  render() {
    const { styles } = this.context;
    const { actions, renderedMessages, fetchingOlder, listRef } = this.props;

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
        keyExtractor={item => item.key}
        onStartReached={actions.fetchOlder}
        onEndReached={actions.fetchNewer}
        onRefresh={actions.fetchOlder}
        ref={component => {
          if (listRef) listRef(component);
        }}
      />
    );
  }
}
