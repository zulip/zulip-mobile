/* @flow */
import { connect } from 'react-redux';

import React, { Component } from 'react';
import { FlatList } from 'react-native';

import type { GlobalState, SubscriptionsState } from '../types';
import { Popup } from '../common';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';
import StreamItem from '../streams/StreamItem';

type Props = {
  filter: string,
  onAutocomplete: (name: string) => void,
  subscriptions: SubscriptionsState,
};

class StreamAutocomplete extends Component<Props> {
  props: Props;

  shouldComponentUpdate(nextProps: Props) {
    // if filter string becomes empty then do not re-render
    // persists previous render, so that it can have some height and scale down animation is visible
    return nextProps.filter.length > 0;
  }

  render() {
    const { filter, subscriptions, onAutocomplete } = this.props;

    if (filter.length === 0) {
      return null;
    }

    const streams = subscriptions.filter(x =>
      x.name.toLowerCase().startsWith(filter.toLowerCase()),
    );

    if (streams.length === 0) {
      return null;
    }

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={streams.length}
          data={streams}
          keyExtractor={item => item.stream_id.toString()}
          renderItem={({ item }) => (
            <StreamItem
              name={item.name}
              isMuted={!item.in_home_view}
              isPrivate={item.invite_only}
              iconSize={12}
              color={item.color}
              onPress={() => onAutocomplete(`**${item.name}**`)}
            />
          )}
        />
      </Popup>
    );
  }
}

export default connect((state: GlobalState) => ({
  subscriptions: getSubscribedStreams(state),
}))(StreamAutocomplete);
