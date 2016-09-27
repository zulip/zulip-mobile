import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import {
  getLatestMessages,
} from './streamActions';

import ZulipMessageGroupView from '../message/ZulipMessageGroupView';
import ZulipMessageView from '../message/ZulipMessageView';

const styles = StyleSheet.create({
  scrollView: {
  },
});

class ZulipStreamView extends React.Component {
  componentDidMount() {
    // We use setTimeout with time=0 to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    setTimeout(() => this.props.getLatestMessages(this.props.auth), 0);
  }

  render() {
    return (
      <ScrollView
        style={styles.scrollView}
        automaticallyAdjustContentInset="false"
      >
        <View />
        {this.props.messages.map((item) => {
          if (item.type === 'stream') {
            return (
              <ZulipMessageGroupView
                key={item.id}
                stream={{
                  name: item.display_recipient,
                  color: '#cef',
                }}
                thread={item.subject}
              >
                <ZulipMessageView
                  key={item.id}
                  from={item.sender_full_name}
                  message={item.content}
                  timestamp={item.timestamp}
                  avatar_url={item.avatar_url}
                />
              </ZulipMessageGroupView>
            );
          }
          return (<View key={item.id} />);
        })}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  messages: state.stream.messages,
  fetching: state.stream.fetching,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    getLatestMessages,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipStreamView);
