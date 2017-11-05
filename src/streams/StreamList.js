/* @flow */
import React, { Component } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import type { Stream, Auth } from '../types';
import { caseInsensitiveCompareObjFunc } from '../utils/misc';
import StreamItem from './StreamItem';
import { SearchEmptyState } from '../common';
import TopicsList from './TopicsList';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {
  auth: Auth,
  showDescriptions: boolean,
  showSwitch: boolean,
  selected: boolean,
  streams: Stream[],
  unreadByStream: number[],
  onSwitch?: (streamName: string, newValue: boolean) => void,
  clearInput?: () => void,
  doNarrowCloseDrawer?: () => void,
};

type State = {
  openStream: int,
};

export default class StreamList extends Component<Props, State> {
  props: Props;
  state = {
    openStream: null,
  };
  state: State;

  static defaultProps = {
    showDescriptions: false,
    showSwitch: false,
    selected: false,
    streams: [],
    unreadByStream: [],
  };

  openTopics = streamId => {
    this.setState({
      openStream: this.state.openStream === streamId ? null : streamId,
    });
  };

  renderTopicList = item => {
    const { auth, doNarrowCloseDrawer } = this.props;
    return (
      <View>
        {this.renderStreamItem(item)}
        <TopicsList
          streamId={item.stream_id}
          auth={auth}
          doNarrowCloseDrawer={doNarrowCloseDrawer}
          name={item.name}
        />
      </View>
    );
  };

  renderStreamItem = item => {
    const {
      selected,
      showDescriptions,
      showSwitch,
      unreadByStream,
      onSwitch,
      onPress,
    } = this.props;
    return (
      <StreamItem
        name={item.name}
        iconSize={16}
        isPrivate={item.invite_only}
        description={showDescriptions ? item.description : ''}
        color={item.color}
        unreadCount={unreadByStream[item.stream_id]}
        isSelected={item.name === selected}
        isMuted={item.in_home_view === false} // if 'undefined' is not muted
        showSwitch={showSwitch}
        isSwitchedOn={item.subscribed}
        handleNestedPress
        openTopics={this.openTopics}
        onPress={onPress}
        onSwitch={onSwitch}
        streamId={item.stream_id}
      />
    );
  };
  render() {
    const { streams, unreadByStream, clearInput } = this.props;
    const { openStream } = this.state;

    const sortedStreams = streams.sort(caseInsensitiveCompareObjFunc('name'));
    const noResults = streams.length === 0;

    if (noResults) {
      return (
        <SearchEmptyState
          text="No streams found"
          buttonText="All streams"
          buttonAction={clearInput}
        />
      );
    }

    return (
      <FlatList
        style={styles.list}
        initialNumToRender={sortedStreams.length}
        data={sortedStreams}
        extraData={{ ...unreadByStream, ...this.state }}
        keyExtractor={item => item.stream_id}
        renderItem={({ item }) =>
          openStream === item.stream_id ? this.renderTopicList(item) : this.renderStreamItem(item)}
      />
    );
  }
}
