/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import Label from './Label';
import ZulipButton from './ZulipButton';
import { nullFunction } from '../nullObjects';

const componentStyles = StyleSheet.create({
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});

type Props = {|
  text: string,
  buttonText: string,
  buttonAction: () => void,
|};

export default class SearchEmptyState extends PureComponent<Props> {
  static defaultProps = {
    text: 'No Results',
    buttonText: 'Show All',
    buttonAction: nullFunction,
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { text, buttonText, buttonAction } = this.props;

    return (
      <View style={styles.emptyStateContainer}>
        <Label style={componentStyles.text} text={text} />
        {buttonAction !== nullFunction && (
          <ZulipButton
            style={componentStyles.button}
            secondary
            text={buttonText}
            onPress={buttonAction}
          />
        )}
      </View>
    );
  }
}
