import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { ZulipStatusBar } from '../common';
import styles from '../common/styles';
import boundActions from '../boundActions';
import { getMessagesInActiveNarrow, getPointer } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {

  fetchOlder = () => {
    const { auth, fetching, caughtUp, pointer, narrow, fetchMessages } = this.props;
    if (!fetching.older && !caughtUp.older) {
      fetchMessages(auth, pointer.older, 20, 0, narrow);
    }
  }

  fetchNewer = () => {
    const { auth, fetching, caughtUp, pointer, narrow, fetchMessages } = this.props;
    if (!fetching.newer && !caughtUp.newer) {
      fetchMessages(auth, pointer.newer, 0, 20, narrow);
    }
  }

  doNarrow = (newNarrow = [], pointer: number = Number.MAX_SAFE_INTEGER) => {
    const { switchNarrow } = this.props;
    switchNarrow(newNarrow);
  }

  render() {
    return (
      <View style={styles.flex}>
        <ZulipStatusBar />
        <MainScreen
          fetchOlder={this.fetchOlder}
          fetchNewer={this.fetchNewer}
          doNarrow={this.doNarrow}
          {...this.props}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  isOnline: state.app.isOnline,
  subscriptions: state.subscriptions,
  messages: getMessagesInActiveNarrow(state),
  allMessages: state.chat.messages,
  fetching: state.chat.fetching,
  caughtUp: state.chat.caughtUp,
  narrow: state.chat.narrow,
  mute: state.mute,
  pointer: getPointer(state),
  streamlistOpened: state.nav.opened,
});

export default connect(mapStateToProps, boundActions)(MainScreenContainer);
