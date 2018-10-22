/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import Label from './Label';
import ZulipButton from './ZulipButton';
import { nullFunction } from '../nullObjects';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});

type Props = {
  text: string,
  buttonText: string,
  buttonAction: () => void,
};

export default class SearchEmptyState extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    text: 'No Results',
    buttonText: 'Show All',
    buttonAction: nullFunction,
  };

  render() {
    const { text, buttonText, buttonAction } = this.props;

    return (
      <View style={styles.container}>
        <Label style={styles.text} text={text} />
        {buttonAction !== nullFunction && (
          <ZulipButton style={styles.button} secondary text={buttonText} onPress={buttonAction} />
        )}
      </View>
    );
  }
}
