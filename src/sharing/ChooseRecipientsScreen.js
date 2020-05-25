/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { User, Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import UserPickerCard from '../user-picker/UserPickerCard';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  onComplete: (User[]) => void,
|}>;

type State = {|
  filter: string,
|};

class ChooseRecipientsScreen extends PureComponent<Props, State> {
  state = {
    filter: '',
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  handleComplete = (selected: Array<User>) => {
    const { onComplete } = this.props;
    onComplete(selected);
  };

  render() {
    const { filter } = this.state;
    return (
      <Screen
        search
        scrollEnabled={false}
        searchBarOnChange={this.handleFilterChange}
        canGoBack={false}
      >
        <UserPickerCard filter={filter} onComplete={this.handleComplete} />
      </Screen>
    );
  }
}

export default connect<{||}, _, _>()(ChooseRecipientsScreen);
