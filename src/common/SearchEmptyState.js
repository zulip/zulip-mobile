/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ZulipButton, Label } from './';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 10,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
  },
});

export default class SearchEmptyState extends React.PureComponent {
  props: {
    text?: string,
    buttonText?: string,
    buttonAction?: () => void,
  };

  static defaultProps = {
    text: 'No Results',
    buttonText: 'Show All',
  };

  render() {
    const { text, buttonText, buttonAction } = this.props;

    return (
      <View style={styles.container}>
        <Label style={styles.text} text={text} />
        {buttonAction && (
          <ZulipButton style={styles.button} secondary text={buttonText} onPress={buttonAction} />
        )}
      </View>
    );
  }
}
