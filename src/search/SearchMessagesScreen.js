/* @flow strict-local */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import SearchMessagesCard from './SearchMessagesCard';
import styles from '../styles';

type Props = {||};

type State = {|
  query: string,
|};

export default class SearchMessagesScreen extends PureComponent<Props, State> {
  state = {
    query: '',
  };

  handleQueryChange = (query: string) => this.setState({ query });

  render() {
    const { query } = this.state;

    return (
      <Screen search autoFocus searchBarOnChange={this.handleQueryChange} style={styles.flexed}>
        <SearchMessagesCard query={query} />
      </Screen>
    );
  }
}
