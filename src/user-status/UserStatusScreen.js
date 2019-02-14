/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { Input, OptionButton, Screen } from '../common';
import statusSuggestions from './userStatusTextSuggestions';

const styles = StyleSheet.create({
  statusTextInput: {
    margin: 16,
  },
});

type Props = {};

type Status = {
  statusText: string,
};

class UserStatusScreen extends PureComponent<Props, Status> {
  state = {
    statusText: '',
  };

  handleStatusTextChangeText = (statusText: string) => {
    this.setState({
      statusText,
    });
  };

  render() {
    const { statusText } = this.state;
    return (
      <Screen title="User status">
        <Input
          style={styles.statusTextInput}
          placeholder="What's your status?"
          value={statusText}
          onChangeText={this.handleStatusTextChangeText}
        />
        {statusSuggestions.map(statusSuggestion => (
          <OptionButton
            key={statusSuggestion}
            label={statusSuggestion}
            onPress={() => {
              this.handleStatusTextChangeText(statusSuggestion);
            }}
          />
        ))}
      </Screen>
    );
  }
}
export default connect()(UserStatusScreen);
