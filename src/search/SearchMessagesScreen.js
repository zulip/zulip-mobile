/* @flow strict-local */
import React, { PureComponent } from 'react';
import invariant from 'invariant';
import type { ComponentType } from 'react';
import type { EditingEvent } from 'react-native/Libraries/Components/TextInput/TextInput';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Auth, Dispatch, Message } from '../types';
import Screen from '../common/Screen';
import SearchMessagesCard from './SearchMessagesCard';
import { SEARCH_NARROW } from '../utils/narrow';
import { LAST_MESSAGE_ANCHOR } from '../anchor';
import { connect } from '../react-redux';
import { getAuth } from '../account/accountsSelectors';
import { fetchMessages } from '../message/fetchActions';
import { getLoading } from '../directSelectors';
import config from '../config';

type OuterProps = $ReadOnly<{|
  // These should be passed from React Navigation
  navigation: AppNavigationProp<'search-messages'>,
  route: RouteProp<'search-messages', void>,
|}>;

type SelectorProps = $ReadOnly<{|
  auth: Auth,
  loading: boolean,
|}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  dispatch: Dispatch,
  ...SelectorProps,
  // Warning: do not add new props without considering their effect on the
  // behavior of this component's non-React internal state. See comment below.
|}>;

type State = {|
  /** The latest search query we have results for. */
  query: string,

  /**
   * The list of messages found as results for `query`.
   *
   * This is `null` if `query` is empty, representing an empty search box
   * and so effectively not a query to have results from at all.
   */
  messages: $ReadOnlyArray<Message> | null,

  /** Whether there is currently an active valid network request. */
  isFetching: boolean,

  /** Same as caughtUp.older in GlobalState, but for search screen. */
  foundOldest: boolean,
|};

class SearchMessagesScreenInner extends PureComponent<Props, State> {
  state = {
    query: '',
    messages: null,
    isFetching: false,
    foundOldest: true,
  };

  /**
   * PRIVATE.  Send search query to server, fetching message results.
   *
   * Stores the fetched messages in the Redux store. Does not read any
   * of the component's data except `props.dispatch`.
   */
  fetchSearchMessages = async (
    query: string,
  ): Promise<{
    foundNewest: boolean,
    foundOldest: boolean,
    messages: $ReadOnlyArray<Message>,
  }> => {
    const fetchArgs = {
      narrow: SEARCH_NARROW(query),
      anchor: LAST_MESSAGE_ANCHOR,
      numBefore: config.messagesPerRequest,
      numAfter: 0,
    };

    return this.props.dispatch(fetchMessages(fetchArgs));
  };

  // Non-React state. See comment following.
  // Invariant: lastIdSuccess <= lastIdReceived <= lastIdSent.
  lastIdSuccess: number = 1000;
  lastIdReceived: number = 1000;
  lastIdSent: number = 1000;
  isFetchingOlder: boolean = false;

  // This component is less pure than it should be. The correct behavior here is
  // probably that, when props change, all outstanding asynchronous requests
  // should be **synchronously** invalidated before the next render.
  //
  // As the only React prop this component has is `auth`, we ignore this for
  // now: any updates to `auth` would involve this screen being torn down and
  // reconstructed anyway. However, addition of any new props which need to
  // invalidate outstanding requests on change will require more work.

  handleQuerySubmit = async (e: EditingEvent) => {
    const query = e.nativeEvent.text;
    const id = ++this.lastIdSent;

    if (query === '') {
      // The empty query can be resolved without a network call.
      this.lastIdReceived = id;
      this.lastIdSuccess = id;
      this.setState({
        query,
        messages: null,
        isFetching: false,
        foundOldest: true,
      });
      return;
    }

    this.setState({ isFetching: true });
    try {
      const { messages, foundOldest } = await this.fetchSearchMessages(query);

      // Update `state.messages` if this is our new latest result.
      if (id > this.lastIdSuccess) {
        this.lastIdSuccess = id;
        this.setState({
          query,
          messages,
          foundOldest,
        });
      }
    } finally {
      // Updating `isFetching` is the same for success or failure.
      if (id > this.lastIdReceived) {
        this.lastIdReceived = id;
        if (this.lastIdReceived === this.lastIdSent) {
          this.setState({ isFetching: false });
        }

        // TODO: if the request failed, should we arrange to display
        // something to the user?
      }
    }
  };

  // The real work to be done on a query is async.  This wrapper exists
  // just to fire off `handleQuerySubmit` without waiting for it.
  // TODO do we even need this wrapper?
  handleQuerySubmitWrapper = (e: EditingEvent) => {
    this.handleQuerySubmit(e);
  };

  fetchOlder = async () => {
    if (
      this.props.loading
      || this.state.foundOldest
      || this.state.isFetching
      || this.isFetchingOlder
    ) {
      return;
    }

    invariant(
      this.state.messages !== null && this.state.messages.length > 0,
      'must have at least 1 message already fetched',
    );
    this.isFetchingOlder = true;
    try {
      const { query } = this.state;
      const anchor = this.state.messages[0].id;
      // FlowIssue: Flow insists on this `await await`.
      //   Should be equivalent to `await`, so harmless.
      //   See: https://github.com/zulip/zulip-mobile/pull/5052#issuecomment-960296275
      const { messages: fetchedMessages, foundOldest } = await await this.props.dispatch(
        fetchMessages({
          anchor,
          narrow: SEARCH_NARROW(this.state.query),
          numBefore: config.messagesPerRequest,
          numAfter: 0,
        }),
      );
      this.setState(prevState => {
        if (
          prevState.query === query
          // FlowIssue: ?. is needed because array can be empty
          // flowlint-next-line unnecessary-optional-chain:off
          && anchor === prevState.messages?.[0]?.id
        ) {
          // remove the anchor element, that gets fetched by default
          fetchedMessages.pop();
          return { messages: [...fetchedMessages, ...prevState.messages], foundOldest };
        }
        return {};
      });
    } finally {
      this.isFetchingOlder = false;
    }
  };

  fetchNewer = () => {
    // Implementing this should not be necessary.
  };

  render() {
    const { messages, isFetching } = this.state;

    return (
      <Screen
        search
        autoFocus
        searchBarOnSubmit={this.handleQuerySubmitWrapper}
        scrollEnabled={false}
      >
        <SearchMessagesCard
          messages={messages}
          isFetching={isFetching}
          narrow={SEARCH_NARROW(this.state.query)}
          fetchNewer={this.fetchNewer}
          fetchOlder={this.fetchOlder}
        />
      </Screen>
    );
  }
}

const SearchMessagesScreen: ComponentType<OuterProps> = connect(state => ({
  auth: getAuth(state),
  loading: getLoading(state),
}))(SearchMessagesScreenInner);

export default SearchMessagesScreen;
