/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { Screen, Label } from '../common';

const styles = StyleSheet.create({
  helpText: {
    fontSize: 20,
  },
});

export default class WelcomeHelpScreen extends PureComponent<{||}> {
  render() {
    return (
      <Screen title="Help" centerContent padding>
        <Label
          style={styles.helpText}
          text={`Welcome to Zulip!

You'll need to first create an account from your computer. If you're not sure where to start, ask someone from the Zulip community you want to participate in.

Hope to see you back here soon!
`}
        />
      </Screen>
    );
  }
}
