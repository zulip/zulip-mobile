/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Auth } from '../types';
import { connect } from '../react-redux';
import { Screen, Input } from '../common';
import ZulipButton from '../common/ZulipButton';
import { getAuth } from '../selectors';
import addAlertWord from '../api/alert_words/addAlertWord';
import AlertWordList from './AlertWordList';
import removeAlertWord from '../api/alert_words/removeAlertWord';
import SearchEmptyState from '../common/SearchEmptyState';

const styles = {
  containerStyle: {
    marginHorizontal: 7,
    marginTop: 20,
  },
  addButtonStyle: {
    marginTop: 10,
  },
};
type State = {|
  text: string,
|};

type Props = $ReadOnly<{|
  auth: Auth,
  alertWords: Array<string>,
|}>;

class AlertWordScreen extends PureComponent<Props, State> {
  state = {
    text: '',
  };

  handleTextChange = (text: string) => {
    this.setState({
      text,
    });
  };

  handleSubmit = async () => {
    const { auth, alertWords } = this.props;
    const { text } = this.state;
    try {
      addAlertWord(auth, [...alertWords, text]);
    } catch (error) {
      /* eslint-disable no-console */
      console.log(error);
    } finally {
      this.setState({ text: '' });
    }
  };

  handleRemoveAlertWord = async (word: string) => {
    const { auth, alertWords } = this.props;
    const filteredWords = alertWords.filter(alertWord => alertWord === word);
    try {
      removeAlertWord(auth, filteredWords);
    } catch (error) {
      /* eslint-disable no-console */
      console.warn('unable to connect');
    }
  };

  render() {
    const { text } = this.state;
    const { alertWords } = this.props;
    return (
      <Screen title="alert words" style={styles.containerStyle}>
        <View>
          <Input
            placeholder="add an alert word"
            value={text}
            onChangeText={this.handleTextChange}
          />
          <ZulipButton
            disabled={!text}
            secondary
            text="add"
            onPress={this.handleSubmit}
            style={styles.addButtonStyle}
          />
        </View>
        {!alertWords.length && <SearchEmptyState text="No alert words to show" />}
        <AlertWordList alertWords={alertWords} handleRemoveAlertWord={this.handleRemoveAlertWord} />
      </Screen>
    );
  }
}

export default connect(state => ({ auth: getAuth(state), alertWords: state.alertWords }))(
  AlertWordScreen,
);
