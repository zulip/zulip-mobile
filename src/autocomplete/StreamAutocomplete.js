/* @flow */
import React, { Component } from 'react';
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
      .filter(x => x.name.toLowerCase().startsWith(filter.toLowerCase()))
      .slice(0, 5);

    if (streams.length === 0) return null;

    return (
      <Popup>
        {streams.map(x => (
          <StreamItem
            key={x.stream_id}
            name={x.name}
            isMuted={!x.in_home_view}
            isPrivate={x.invite_only}
            iconSize={12}
            color={x.color}
            onPress={() => onAutocomplete(x.name)}
          />
        ))}
      </Popup>
    );
  }
}

const mapStateToProps = (state) => ({
  subscriptions: state.subscriptions,
});

export default connect(mapStateToProps)(StreamAutocomplete);
