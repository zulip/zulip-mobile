/* @flow */
import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';

import type { GlobalState, SubscriptionsState } from '../types';
import { Popup } from '../common';
import StreamItem from '../streams/StreamItem';

class StreamAutocomplete extends Component {
  props: {
    filter: string,
    onAutocomplete: (name: string) => void,
    subscriptions: SubscriptionsState,
  };

  render() {
    const { filter, subscriptions, onAutocomplete } = this.props;
    const streams = subscriptions.filter(x =>
      x.name.toLowerCase().startsWith(filter.toLowerCase()),
    );

    if (streams.length === 0) return null;

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={streams.length}
          data={streams}
          keyExtractor={item => item.stream_id}
          renderItem={({ item }) =>
            <StreamItem
              name={item.name}
              isMuted={!item.in_home_view}
              isPrivate={item.invite_only}
              iconSize={12}
              color={item.color}
              onPress={() => onAutocomplete(item.name)}
            />}
        />
      </Popup>
    );
  }
}

export default connect((state: GlobalState) => ({
  subscriptions: state.subscriptions,
}))(StreamAutocomplete);
