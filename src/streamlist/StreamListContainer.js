import React from 'react';
import { connect } from 'react-redux';

import StreamList from './StreamList';

class StreamListContainer extends React.Component {
  render() {
    return (
      <StreamList {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  subscriptions: state.subscriptions,
});

export default connect(mapStateToProps)(StreamListContainer);
