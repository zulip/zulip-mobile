/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState } from '../types';
import { getSettings } from '../directSelectors';
import { Input, ViewPlaceholder, ZulipButton } from '../common';
import { diagnosticNicknameChange } from '../actions';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    margin: 16,
  },
  marginBottom: {
    flexDirection: 'row',
  },
});

type Props = {|
  dispatch: Dispatch,
  initialNickname: string,
|};

type State = {|
  newNickname: string,
|};

class DiagnosticNicknameEdit extends PureComponent<Props, State> {
  state = {
    newNickname: '',
  };

  handleNameChange = (newNickname: string) => {
    this.setState({ newNickname });
  };

  handleUpdatePress = () => {
    const { dispatch } = this.props;
    const { newNickname } = this.state;
    dispatch(diagnosticNicknameChange(newNickname));
  };

  render() {
    const { initialNickname } = this.props;

    return (
      <View style={styles.wrapper}>
        <Input
          autoFocus
          style={styles.marginBottom}
          placeholder="Nickname"
          defaultValue={initialNickname}
          onChangeText={this.handleNameChange}
        />
        <ViewPlaceholder height={16} />
        <ZulipButton text="Update" onPress={this.handleUpdatePress} />
      </View>
    );
  }
}

export default connect((state: GlobalState, props) => ({
  initialNickname: getSettings(state).diagnosticNickname,
}))(DiagnosticNicknameEdit);
