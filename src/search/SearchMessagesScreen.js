/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { Context } from '../types';
import { Screen } from '../common';
import SearchMessagesCard from './SearchMessagesCard';

type Props = {};

type State = {
  query: string,
};

export default class SearchMessagesScreen extends PureComponent<Props, State> {
  context: Context;
  state = {
    query: '',
  };

  static contextTypes = {
    styles: () => null,
  };

  handleQueryChange = (query: string) => this.setState({ query });

  render() {
    const { styles } = this.context;
    const { query } = this.state;

    return (
      <Screen search autoFocus searchBarOnChange={this.handleQueryChange} style={styles.flexed}>
        <SearchMessagesCard query={query} />
      </Screen>
    );
  }
}
