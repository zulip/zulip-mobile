/* @flow */
import React, { PureComponent } from 'react';
import { SectionList, StyleSheet } from 'react-native';

import type { Actions, UnreadStream } from '../types';
import { Label, SearchEmptyState } from '../common';
import UnreadStreamsCard from './UnreadStreamsCard';
import ConversationList from '../conversations/ConversationList';

const componentStyles = StyleSheet.create({
  label: {
    paddingTop: 8,
    paddingLeft: 4,
    paddingBottom: 4,
  },
});

type Props = {
  actions: Actions,
  conversations: Object[],
  presences: Object,
  usersByEmail: Object,
  unreadStreamsAndTopics: UnreadStream[],
  unreadStreamsAndTopics: any,
};

export default class UnreadCards extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { conversations, unreadStreamsAndTopics, ...restProps } = this.props;
    const unreadCards = [];
    if (conversations.length > 0) {
      unreadCards.push({
        key: 'private',
        data: [{ conversations, ...restProps }],
        title: 'Private Messages',
        Component: ConversationList,
      });
    }
    if (unreadStreamsAndTopics.length > 0) {
      unreadCards.push({
        key: 'stream',
        data: [{ unreadStreamsAndTopics }],
        title: 'STREAMS',
        Component: UnreadStreamsCard,
      });
    }

    if (unreadCards.length === 0) {
      return <SearchEmptyState text="No unread messages" />;
    }
    return (
      <SectionList
        stickySectionHeadersEnabled
        initialNumToRender={2}
        sections={unreadCards}
        renderSectionHeader={({ section }) => (
          <Label style={[styles.backgroundColor, componentStyles.label]} text={section.title} />
        )}
        renderItem={({ item, section }) => {
          const { Component } = section;
          return <Component {...item} />;
        }}
      />
    );
  }
}
