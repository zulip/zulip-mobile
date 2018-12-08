/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
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

class StreamAutocomplete extends PureComponent<Props> {
  props: Props;

  onAutocomplete = (name: string): void => {
    this.props.onAutocomplete(`**${name}**`);
  };

  render() {
    const { filter, subscriptions } = this.props;
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
              onPress={this.onAutocomplete}
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
