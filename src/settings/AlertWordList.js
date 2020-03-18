/* @flow strict-local */

import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AlertWordCard from './AlertWordCard';

const styles = StyleSheet.create({
  containerStyle: {
    marginHorizontal: 15,
    marginVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

type Props = $ReadOnly<{|
  alertWords: Array<string>,
  handleRemoveAlertWord: string => Promise<void>,
|}>;

export default class AlertWordList extends PureComponent<Props> {
  render() {
    const { alertWords, handleRemoveAlertWord } = this.props;
    return (
      <ScrollView>
        <View style={styles.containerStyle}>
          {alertWords.map((word: string) => (
            <AlertWordCard word={word} key={word} handleRemoveAlertWord={handleRemoveAlertWord} />
          ))}
        </View>
      </ScrollView>
    );
  }
}
