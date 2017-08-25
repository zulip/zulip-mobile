/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import SearchMessagesContainer from './SearchMessagesContainer';

export default class SearchMessagesScreen extends PureComponent {
  state: {
    query: string,
  };

  state = {
    query: '',
  };

  handleQueryChange = (query: string) => this.setState({ query });

  render() {
    const { query } = this.state;

    return (
      <Screen search title="Search" searchBarOnChange={this.handleQueryChange}>
        <SearchMessagesContainer query={query} />
      </Screen>
    );
  }
}
