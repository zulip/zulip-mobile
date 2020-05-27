/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Auth, AlertWordsState } from '../types';
import { connect } from '../react-redux';
import { Screen, Input } from '../common';
import ZulipButton from '../common/ZulipButton';
import { getAuth, getAlertWords } from '../selectors';
import addAlertWords from '../api/alert_words/addAlertWords';
import AlertWordList from './AlertWordList';
import removeAlertWords from '../api/alert_words/removeAlertWords';
import SearchEmptyState from '../common/SearchEmptyState';
import ErrorMsg from '../common/ErrorMsg';
import { showToast } from '../utils/info';
import * as logging from '../utils/logging';

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
  progress: boolean,
  errorMessage: string,
|};

type Props = $ReadOnly<{|
  auth: Auth,
  alertWords: AlertWordsState,
|}>;

/**
 * Alert words are strings that will be highlighted in messageList
 */
class AlertWordScreen extends PureComponent<Props, State> {
  state = {
    text: '',
    progress: false,
    errorMessage: '',
  };

  handleTextChange = (text: string) => {
    this.setState({
      text,
    });
  };

  handleSubmit = async () => {
    const { text, errorMessage } = this.state;
    const { alertWords, auth } = this.props;

    if (alertWords.includes(text.trim())) {
      this.setState({ errorMessage: 'This word is already present' });
    } else {
      this.setState({ progress: true });
      try {
        await addAlertWords(auth, [text]);
        this.setState({ text: '' });
        showToast('Created a new alert word');
      } catch (err) {
        logging.error(err);
        showToast(err.message);
      } finally {
        this.setState({ progress: false });
        if (errorMessage) {
          this.setState({ errorMessage: '' });
        }
      }
    }
  };

  handleRemoveAlertWord = async (word: string) => {
    const { auth } = this.props;

    try {
      await removeAlertWords(auth, [word]);
    } catch (error) {
      logging.error(error);
      showToast(error.message);
    }
  };

  render() {
    const { text, progress, errorMessage } = this.state;
    const { alertWords } = this.props;

    return (
      <Screen title="Alert words" style={styles.containerStyle}>
        <View>
          <Input
            editable={!progress}
            placeholder="Add an alert word"
            value={text}
            onChangeText={this.handleTextChange}
            onSubmitEditing={this.handleSubmit}
          />
          <ZulipButton
            disabled={!text}
            secondary
            text="Add"
            onPress={this.handleSubmit}
            style={styles.addButtonStyle}
          />
          {errorMessage !== '' && <ErrorMsg error={errorMessage} />}
        </View>
        {!alertWords.length && <SearchEmptyState text="No alert words to show" />}
        <AlertWordList alertWords={alertWords} handleRemoveAlertWord={this.handleRemoveAlertWord} />
      </Screen>
    );
  }
}

export default connect(state => ({ auth: getAuth(state), alertWords: getAlertWords(state) }))(
  AlertWordScreen,
);
