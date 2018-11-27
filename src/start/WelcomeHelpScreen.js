/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { Screen, RawLabel } from '../common';

const styles = StyleSheet.create({
  helpText: {
    fontSize: 20,
  },
});

export default class WelcomeHelpScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Help" centerContent padding>
        <RawLabel
          style={styles.helpText}
          text={`Welcome to Zulip!

You'll need to first create an account from your computer. If you're not sure where to start, go to zulipchat.com from your web browser.

Hope to see you back here soon!
`}
        />
      </Screen>
    );
  }
}
