/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState } from '../types';
import { Input, OptionButton, Screen, ZulipButton } from '../common';
import { getSelfUserStatusText } from '../selectors';
import { IconCancel, IconDone } from '../common/Icons';
import statusSuggestions from './userStatusTextSuggestions';
import { updateUserStatusText } from './userStatusActions';
import { navigateBack } from '../nav/navActions';

const styles = StyleSheet.create({
  statusTextInput: {
    margin: 16,
  },
  buttonsWrapper: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

type Props = {
  dispatch: Dispatch,
  userStatusText: string,
};

type State = {
  statusText: string,
};

class UserStatusScreen extends PureComponent<Props, State> {
  state = {
    statusText: this.props.userStatusText,
  };

  setStatusTextState = (statusText: string) => {
    this.setState({
      statusText,
    });
  };

  handleStatusTextUpdate = () => {
    const { dispatch } = this.props;
    const { statusText } = this.state;
    dispatch(updateUserStatusText(statusText));
    dispatch(navigateBack());
  };

  handleStatusTextClear = () => {
    const { dispatch } = this.props;
    dispatch(updateUserStatusText(''));
    dispatch(navigateBack());
  };

  render() {
    const { statusText } = this.state;

    return (
      <Screen title="User status">
        <Input
          autoFocus
          style={styles.statusTextInput}
          placeholder="What's your status?"
          value={statusText}
          onChangeText={this.setStatusTextState}
        />
        {statusSuggestions.map(statusSuggestion => (
          <OptionButton
            key={statusSuggestion}
            label={statusSuggestion}
            onPress={() => {
              this.setStatusTextState(statusSuggestion);
            }}
          />
        ))}
        <View style={styles.buttonsWrapper}>
          <ZulipButton
            style={styles.button}
            secondary
            text="Clear"
            onPress={this.handleStatusTextClear}
            Icon={IconCancel}
          />
          <ZulipButton
            style={styles.button}
            text="Update"
            onPress={this.handleStatusTextUpdate}
            Icon={IconDone}
          />
        </View>
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  userStatusText: getSelfUserStatusText(state),
}))(UserStatusScreen);
