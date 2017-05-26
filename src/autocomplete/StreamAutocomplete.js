/* @flow */
import React, { Component } from 'react';
import { ListView } from 'react-native';
import { connect } from 'react-redux';

import { Popup } from '../common';
import StreamItem from '../streamlist/StreamItem';

class StreamAutocomplete extends Component {

  props: {
    filter: string;
    onAutocomplete: (name: string) => {},
    subscriptions: Object[],
  };

  render() {
    const { filter, subscriptions, onAutocomplete } = this.props;
    const streams = subscriptions
      .filter(x => x.name.toLowerCase().startsWith(filter.toLowerCase()));

    if (streams.length === 0) return null;

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(streams);

    return (
      <Popup>
        <ListView
          dataSource={dataSource}
          renderRow={x => (
            <StreamItem
              key={x.stream_id}
              name={x.name}
              isMuted={!x.in_home_view}
              isPrivate={x.invite_only}
              iconSize={12}
              color={x.color}
              onPress={() => onAutocomplete(x.name)}
            />
          )}
        />
      </Popup>
    );
  }
}

const mapStateToProps = (state) => ({
  subscriptions: state.subscriptions,
});

export default connect(mapStateToProps)(StreamAutocomplete);
