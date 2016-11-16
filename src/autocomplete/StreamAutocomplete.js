import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Popup } from '../common';
import StreamItem from '../streamlist/StreamItem';

class StreamAutocomplete extends Component {

  props: {
    filter: string;
    onAutocomplete: (name: string) => {},
  };

  render() {
    const { filter, subscriptions, onAutocomplete } = this.props;
    const streams = subscriptions.toJS().filter(x => x.name.startsWith(filter));

    return (
      <Popup>
        {streams.map(x =>
          <StreamItem
            key={x.stream_id}
            name={x.name}
            description={x.description}
            isPrivate={x.invite_only}
            color={x.color}
            onPress={() => onAutocomplete(x.name)}
          />
        )}
      </Popup>
    );
  }
}

const mapStateToProps = (state) => ({
  subscriptions: state.subscriptions,
});

export default connect(mapStateToProps)(StreamAutocomplete);
