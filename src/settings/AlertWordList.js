/* @flow strict-local */

import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AlertWord from './AlertWord';
import type { AlertWordsState } from '../types';

const styles = StyleSheet.create({
  containerStyle: {
    marginHorizontal: 15,
    marginVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

type Props = $ReadOnly<{|
  alertWords: AlertWordsState,
  handleRemoveAlertWord: string => Promise<void>,
|}>;

export default class AlertWordList extends PureComponent<Props> {
  render() {
    const { alertWords, handleRemoveAlertWord } = this.props;

    return (
      <ScrollView>
        <View style={styles.containerStyle}>
          {alertWords.map((word: string) => (
            <AlertWord word={word} key={word} handleRemoveAlertWord={handleRemoveAlertWord} />
          ))}
        </View>
      </ScrollView>
    );
  }
}
