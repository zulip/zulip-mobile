/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';
import { withNavigationFocus } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { compose } from 'redux';

import { connect } from '../react-redux';
import type { ThemeData } from '../styles';
import styles, { ThemeContext, createStyleSheet } from '../styles';
import type { Dispatch, Fetching, Narrow, EditMessage } from '../types';
import { KeyboardAvoider, OfflineNotice, ZulipStatusBar } from '../common';
import ChatNavBar from '../nav/ChatNavBar';
import MessageList from '../webview/MessageList';
import NoMessages from '../message/NoMessages';
import FetchError from './FetchError';
import InvalidNarrow from './InvalidNarrow';
import { fetchMessagesInNarrow } from '../message/fetchActions';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import { canSendToNarrow } from '../utils/narrow';
import { getLoading, getSession } from '../directSelectors';
import { getFetchingForNarrow } from './fetchingSelectors';
import { getShownMessagesForNarrow, isNarrowValid as getIsNarrowValid } from './narrowsSelectors';

type SelectorProps = {|
  isNarrowValid: boolean,
  fetching: Fetching,
  haveNoMessages: boolean,
  loading: boolean,
  eventQueueId: number,
|};

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<{| ...NavigationStateRoute, params: {| narrow: Narrow |} |}>,
  dispatch: Dispatch,

  // From React Navigation's `withNavigationFocus` HOC. Type copied
  // from the libdef.
  isFocused: ?boolean,

  ...SelectorProps,
|}>;

type State = {|
  editMessage: EditMessage | null,
  fetchError: Error | null,
|};

const componentStyles = createStyleSheet({
  screen: {
    flex: 1,
    flexDirection: 'column',
  },
});

class ChatScreen extends PureComponent<Props, State> {
  static contextType = ThemeContext;
  context: ThemeData;

  state = {
    editMessage: null,
    fetchError: null,
  };

  // This could live in `this.state`, but it isn't used in `render`.
  // If we don't use `this.setState` to update it, we don't have to
  // worry about pointless rerenders. We just check it in
  // `componentDidUpdate`.
  shouldFetchWhenNextFocused: boolean = false;

  componentDidMount() {
    this.fetch();
  }

  /* eslint-disable react/no-did-update-set-state */
  componentDidUpdate(prevProps, prevState) {
    const { isFocused } = this.props;

    // When the event queue changes, schedule a fetch
    if (prevProps.eventQueueId !== this.props.eventQueueId) {
      this.shouldFetchWhenNextFocused = true;
    }

    // Do a scheduled fetch, if it's time
    if (this.shouldFetchWhenNextFocused && isFocused === true) {
      this.shouldFetchWhenNextFocused = false;
      this.fetch();
    }
  }

  clearError = () => {
    this.setState({ fetchError: null });
  };

  /**
   * Fetch messages for this narrow.
   *
   * See `MessagesState` for background about the fetching, including
   * why this is nearly the only place where additional data fetching
   * is required.  See `fetchMessagesInNarrow` and `fetchMessages` for
   * more details, including how Redux is kept up-to-date during the
   * whole process.
   */
  fetch = async () => {
    const { narrow } = this.props.navigation.state.params;
    const { dispatch } = this.props;
    try {
      await dispatch(fetchMessagesInNarrow(narrow));
    } catch (e) {
      this.setState({ fetchError: e });
    }
  };

  setEditMessage = (editMessage: EditMessage | null) => {
    this.setState({ editMessage });
  };

  render() {
    const { isNarrowValid, fetching, haveNoMessages, loading, navigation } = this.props;
    const { narrow } = navigation.state.params;
    const { editMessage } = this.state;

    const isFetching = fetching.older || fetching.newer || loading;
    const showMessagePlaceholders = haveNoMessages && isFetching;
    const sayNoMessages = haveNoMessages && !isFetching;
    const showComposeBox = canSendToNarrow(narrow) && !showMessagePlaceholders;

    return (
      <ActionSheetProvider>
        <View style={[componentStyles.screen, { backgroundColor: this.context.backgroundColor }]}>
          <KeyboardAvoider style={styles.flexed} behavior="padding">
            <ZulipStatusBar narrow={narrow} />
            <ChatNavBar narrow={narrow} editMessage={editMessage} />
            <OfflineNotice />
            <UnreadNotice narrow={narrow} />
            {(() => {
              if (!isNarrowValid) {
                return <InvalidNarrow narrow={narrow} />;
              } else if (this.state.fetchError !== null) {
                return <FetchError narrow={narrow} error={this.state.fetchError} />;
              } else if (sayNoMessages) {
                return <NoMessages narrow={narrow} />;
              } else {
                return (
                  <MessageList
                    narrow={narrow}
                    showMessagePlaceholders={showMessagePlaceholders}
                    startEditMessage={this.setEditMessage}
                  />
                );
              }
            })()}
            {showComposeBox && (
              <ComposeBox
                narrow={narrow}
                editMessage={editMessage}
                completeEditMessage={() => this.setEditMessage(null)}
              />
            )}
          </KeyboardAvoider>
        </View>
      </ActionSheetProvider>
    );
  }
}

export default compose(
  // https://reactnavigation.org/docs/4.x/function-after-focusing-screen/#triggering-an-action-with-the-withnavigationfocus-higher-order-component
  withNavigationFocus,
  connect<SelectorProps, _, _>((state, props) => {
    const { narrow } = props.navigation.state.params;
    return {
      isNarrowValid: getIsNarrowValid(state, narrow),
      loading: getLoading(state),
      fetching: getFetchingForNarrow(state, narrow),
      haveNoMessages: getShownMessagesForNarrow(state, narrow).length === 0,
      eventQueueId: getSession(state).eventQueueId,
    };
  }),
)(ChatScreen);
