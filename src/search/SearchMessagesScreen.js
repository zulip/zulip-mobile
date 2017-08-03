/* @flow */
import React, { PureComponent } from 'react';

import SearchScreen from './SearchScreen';
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
      <SearchScreen title="Search" searchBarOnChange={this.handleQueryChange}>
        <SearchMessagesContainer query={query} />
      </SearchScreen>
    );
  }
}
