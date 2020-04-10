/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { TranslationContext } from '../boot/TranslationProvider';

import type { GetText, Dispatch } from '../types';
import { connect } from '../react-redux';
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
    margin: 8,
  },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  userStatusText: string,
|}>;

type State = {|
  statusText: string,
|};

class UserStatusScreen extends PureComponent<Props, State> {
  static contextType = TranslationContext;
  context: GetText;

  state = {
    statusText: this.props.userStatusText,
  };

  setStatusTextState = (statusText: string) => {
    this.setState({
      statusText,
    });
  };

  updateStatusText = (statusText: string) => {
    const { dispatch } = this.props;
    dispatch(updateUserStatusText(statusText));
    dispatch(navigateBack());
  };

  handleStatusTextUpdate = () => {
    const { statusText } = this.state;
    this.updateStatusText(statusText);
  };

  handleStatusTextClear = () => {
    this.setStatusTextState('');
    this.updateStatusText('');
  };

  render() {
    const { statusText } = this.state;
    const _ = this.context;

    return (
      <Screen title="User status">
        <Input
          autoFocus
          maxLength={60}
          style={styles.statusTextInput}
          placeholder="What's your status?"
          value={statusText}
          onChangeText={this.setStatusTextState}
        />
        <FlatList
          data={statusSuggestions}
          keyboardShouldPersistTaps="always"
          keyExtractor={item => item}
          renderItem={({ item, index }) => (
            <OptionButton
              key={item}
              label={item}
              onPress={() => {
                this.setStatusTextState(_(item));
              }}
            />
          )}
        />
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

export default connect(state => ({
  userStatusText: getSelfUserStatusText(state),
}))(UserStatusScreen);
