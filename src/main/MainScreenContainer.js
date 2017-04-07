import React from 'react';
import {connect} from 'react-redux';

import config from '../config';
import boundActions from '../boundActions';
import {registerAppActivity} from '../utils/activity';
import {getMessagesInActiveNarrow, getAnchor} from '../chat/chatSelectors';
import {getAuth} from '../account/accountSelectors';
import MainScreen from './MainScreen';

class MainScreenContainer extends React.Component {
  fetchOlder = () => {
    const {
      auth,
      fetching,
      caughtUp,
      anchor,
      narrow,
      fetchMessages,
    } = this.props;
    if (!fetching.older && !caughtUp.older && anchor) {
      fetchMessages(auth, anchor.older, config.messagesPerRequest, 0, narrow);
    }
  };

  fetchNewer = () => {
    const {
      auth,
      fetching,
      caughtUp,
      anchor,
      narrow,
      fetchMessages,
    } = this.props;
    if (!fetching.newer && !caughtUp.newer && anchor) {
      fetchMessages(auth, anchor.newer, 0, config.messagesPerRequest, narrow);
    }
  };

  doNarrow = (newNarrow = [], anchor: number = Number.MAX_SAFE_INTEGER) => {
    const {auth, switchNarrow, messages} = this.props;
    registerAppActivity(auth);
    requestIdleCallback(() =>
      switchNarrow(newNarrow, messages.filter(msg => msg.id === anchor)));
  };

  markAsRead = (() => {
    // We want a list of all newly read messages to the server at a fairly
    // low frequency, so we store invocations of this function and send off
    // the list at most every `READ_UPDATE_FREQ` milliseconds.
    // TODO: this might be a lot nicer as a decorator
    const READ_UPDATE_FREQ = 2000;
    let lastSentTime = 0;
    let storedMessages = [];

    return messages => {
      const {auth, updateMessageFlags} = this.props;

      storedMessages.push(...messages);

      if (messages.length > 0) {
        for (const message of messages) {
          // NOTE: Mutating state like this is a BAD IDEA!
          // We're only doing it here because:
          // 1) The message flags don't affect rendering
          // 2) We don't want to update flags multiple times for the same message
          //    and updating state this frequently would be inefficient
          if (!message.flags) message.flags = [];
          message.flags.push('read');
        }
      }

      // Update the server with read messages
      if (
        Date.now() > lastSentTime + READ_UPDATE_FREQ &&
        storedMessages.length > 0
      ) {
        updateMessageFlags(
          auth,
          storedMessages.map(msg => msg.id),
          'add',
          'read'
        );
        storedMessages = [];
        lastSentTime = Date.now();
      }
    };
  })();

  render() {
    return (
      <MainScreen
        fetchOlder={this.fetchOlder}
        fetchNewer={this.fetchNewer}
        doNarrow={this.doNarrow}
        markAsRead={this.markAsRead}
        {...this.props}
      />
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    isOnline: state.app.isOnline,
    orientation: state.app.orientation,
    subscriptions: state.subscriptions,
    messages: getMessagesInActiveNarrow(state),
    allMessages: state.chat.messages,
    fetching: state.chat.fetching,
    caughtUp: state.chat.caughtUp,
    narrow: state.chat.narrow,
    mute: state.mute,
    anchor: getAnchor(state),
  }),
  boundActions
)(MainScreenContainer);
