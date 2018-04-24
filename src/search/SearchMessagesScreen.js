/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import SearchMessagesContainer from './SearchMessagesContainer';

type Props = {};

type State = {
  query: string,
};

export default class SearchMessagesScreen extends PureComponent<Props, State> {
  state: State;

  state = {
    query: '',
  };

  handleQueryChange = (query: string) => this.setState({ query });

  render() {
    const { query } = this.state;

    return (
      <Screen search autoFocus searchBarOnChange={this.handleQueryChange}>
        <SearchMessagesContainer query={query} />
      </Screen>
    );
  }
}
