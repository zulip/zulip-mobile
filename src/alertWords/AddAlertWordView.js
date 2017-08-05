/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Input, ZulipButton } from '../common';
import type { Auth } from '../types';
import apiAddAlertWord from '../api/addAlertWord';

const componentStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    margin: 8,
    padding: 8,
    alignItems: 'center',
  },
  inputWrapper: { flex: 2, margin: 2 },
  addButton: { flex: 1, margin: 2 },
});

export default class AddAlertWordView extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    auth: Auth,
  };

  textInput: TextInput;

  state: { alertWord: string };

  state = { alertWord: '' };

  addAlertWord = () => {
    const { auth } = this.props;
    const { alertWord } = this.state;
    apiAddAlertWord(auth, alertWord);
    this.textInput.clear();
    this.setState({
      alertWord: '',
    });
  };

  render() {
    const { styles } = this.context;
    const { alertWord } = this.state;

    return (
      <View style={[componentStyles.row, this.context.styles.cardView]}>
        <View style={componentStyles.inputWrapper}>
          <Input
            style={styles.field}
            textInputRef={component => {
              this.textInput = component;
            }}
            placeholder="Alert word"
            value={alertWord}
            onTextChange={input => this.setState({ alertWord: input })}
            blurOnSubmit={false}
            onSubmitEditing={this.addAlertWord}
          />
        </View>
        <ZulipButton
          style={componentStyles.addButton}
          text="Add"
          onPress={() => this.addAlertWord()}
        />
      </View>
    );
  }
}
