/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { Actions, TypingState } from '../types';
import { nullFunction } from '../nullObjects';
import { LoadingIndicator } from '../common';
import MessageListSection from './MessageListSection';
import MessageListItem from './MessageListItem';

type Props = {
  actions: Actions,
  typingUsers?: TypingState,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  singleFetchProgress: boolean,
  renderedMessages: Object[],
  listRef: (component: any) => void,
  onScroll?: () => void,
};

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
      singleFetchProgress,
      fetchingOlder,
      fetchingNewer,
      listRef,
      onScroll,
    } = this.props;

    if (!singleFetchProgress && fetchingNewer) {
      return <LoadingIndicator active backgroundColor={styles.backgroundColor} />;
    }

    return (
      <SectionList
        style={styles.flexed}
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
        onScroll={onScroll}
        ref={component => {
          if (listRef) listRef(component);
        }}
      />
    );
  }
}
