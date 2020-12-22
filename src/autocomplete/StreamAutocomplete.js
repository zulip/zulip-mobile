/* @flow strict-local */

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { SubscriptionsState, Dispatch } from '../types';
import { connect } from '../react-redux';
import { Popup } from '../common';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';
import StreamItem from '../streams/StreamItem';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  filter: string,
  onAutocomplete: (name: string) => void,
  subscriptions: SubscriptionsState,
|}>;

class StreamAutocomplete extends PureComponent<Props> {
  onAutocomplete = (name: string): void => {
    this.props.onAutocomplete(`**${name}**`);
  };

  render() {
    const { filter, subscriptions } = this.props;
    const matchingSubscriptions = subscriptions.filter(x =>
      x.name.toLowerCase().startsWith(filter.toLowerCase()),
    );

    if (matchingSubscriptions.length === 0) {
      return null;
    }

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={matchingSubscriptions.length}
          data={matchingSubscriptions}
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

export default connect(state => ({
  subscriptions: getSubscribedStreams(state),
}))(StreamAutocomplete);
