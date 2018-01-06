/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { Props } from '../message/MessageListContainer';
import { nullFunction } from '../nullObjects';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';
import MessageListLoading from '../message/MessageListLoading';

export default class MessageList extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
    intl: () => null,
  };

  props: Props;

  static defaultProps = {
    onScroll: nullFunction,
  };

  render() {
    const { styles } = this.context;
    const {
      actions,
      renderedMessages,
      showMessagePlaceholders,
      fetching,
      listRef,
      onScroll,
    } = this.props;

    if (showMessagePlaceholders) {
      return <MessageListLoading />;
    }

    return (
      <SectionList
        style={styles.flexed}
        initialNumToRender={20}
        sections={renderedMessages}
        refreshing={fetching.older}
        // initialScrollIndex={123}
        removeClippedSubviews // potentially buggy
        renderSectionHeader={({ section }) => <MessageListSection {...section} />}
        renderItem={({ item }) => <MessageListItem {...item} />}
        keyExtractor={item => item.key}
        onStartReached={actions.fetchOlder}
        onEndReached={actions.fetchNewer}
        onRefresh={actions.fetchOlder}
        onScroll={onScroll}
        ref={component => {
          if (listRef) listRef(component);
        }}
      />
    );
  }
}
