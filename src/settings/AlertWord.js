/* @flow strict-local */

import * as React from 'react';
import { View, TouchableHighlight, Text, StyleSheet, Platform } from 'react-native';
import { IconCross } from '../common/Icons';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'white',
    margin: 5,
    padding: 5,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
    borderRadius: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    fontSize: 25,
  },
  iconStyle: {
    marginLeft: 12,
  },
  textStyle: { fontSize: 16 },
});

type Props = $ReadOnly<{|
  word: string,
  handleRemoveAlertWord: string => Promise<void>,
|}>;

export default class AlertWord extends React.PureComponent<Props> {
  render() {
    const { word, handleRemoveAlertWord } = this.props;

    return (
      <TouchableHighlight>
        <View style={styles.containerStyle}>
          <Text style={styles.textStyle}>{word}</Text>
          <IconCross
            style={styles.iconStyle}
            size={21}
            onPress={() => handleRemoveAlertWord(word)}
          />
        </View>
      </TouchableHighlight>
    );
  }
}
