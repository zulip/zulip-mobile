/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import type { Auth, Dispatch, Message } from '../types';
import { Screen } from '../common';
import SearchMessagesCard from './SearchMessagesCard';
import styles from '../styles';
import { SEARCH_NARROW } from '../utils/narrow';
import { LAST_MESSAGE_ANCHOR } from '../anchor';
import { connect } from '../react-redux';
import { getAuth } from '../account/accountsSelectors';
import { fetchMessages } from '../message/fetchActions';

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<NavigationStateRoute>,

  auth: Auth,
  dispatch: Dispatch,
  // Warning: do not add new props without considering their effect on the
  // behavior of this component's non-React internal state. See comment below.
|}>;

type State = {|
  /** The list of messages returned for the latest query, or `null` if there is
   *  effectively no "latest query" to have results from.
   */
  messages: Message[] | null,
  /** Whether there is currently an active valid network request. */
  isFetching: boolean,
|};

class SearchMessagesScreen extends PureComponent<Props, State> {
  state = {
    messages: null,
    isFetching: false,
  };

  /**
   * PRIVATE.  Send search query to server, fetching message results.
   *
   * Stores the fetched messages in the Redux store. Does not read any
   * of the component's data except `props.dispatch`.
   */
  fetchSearchMessages = async (query: string): Promise<Message[]> => {
    const fetchArgs = {
      narrow: SEARCH_NARROW(query),
      anchor: LAST_MESSAGE_ANCHOR,
      numBefore: 20,
      numAfter: 0,
    };

    return this.props.dispatch(fetchMessages(fetchArgs));
  };

  // Non-React state. See comment following.
  // Invariant: lastIdSuccess <= lastIdReceived <= lastIdSent.
  lastIdSuccess: number = 1000;
  lastIdReceived: number = 1000;
  lastIdSent: number = 1000;

  // This component is less pure than it should be. The correct behavior here is
  // probably that, when props change, all outstanding asynchronous requests
  // should be **synchronously** invalidated before the next render.
  //
  // As the only React prop this component has is `auth`, we ignore this for
  // now: any updates to `auth` would involve this screen being torn down and
  // reconstructed anyway. However, addition of any new props which need to
  // invalidate outstanding requests on change will require more work.

  handleQueryChange = async (query: string) => {
    const id = ++this.lastIdSent;

    if (query === '') {
      // The empty query can be resolved without a network call.
      this.lastIdReceived = id;
      this.lastIdSuccess = id;
      this.setState({ messages: null, isFetching: false });
      return;
    }

    this.setState({ isFetching: true });
    try {
      const messages = await this.fetchSearchMessages(query);

      // Update `state.messages` if this is our new latest result.
      if (id > this.lastIdSuccess) {
        this.lastIdSuccess = id;
        this.setState({ messages });
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
  // just to fire off `handleQueryChange` without waiting for it.
  // TODO do we even need this wrapper?
  handleQueryChangeWrapper = (query: string) => {
    this.handleQueryChange(query);
  };

  render() {
    const { messages, isFetching } = this.state;

    return (
      <Screen
        search
        autoFocus
        searchBarOnChange={this.handleQueryChangeWrapper}
        style={styles.flexed}
      >
        <SearchMessagesCard messages={messages} isFetching={isFetching} />
      </Screen>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
}))(SearchMessagesScreen);
