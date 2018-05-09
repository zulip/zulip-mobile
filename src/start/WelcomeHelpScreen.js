/* @flow */
import React, { PureComponent } from 'react';

import { Screen, RawLabel, Centerer } from '../common';

export default class WelcomeHelpScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Help" padding>
        <Centerer>
          <RawLabel
            text={
`Welcome to Zulip!

You'll need to first create an account from your computer. If you're not sure where to start, go to zulipchat.com from your web browser.

Hope to see you back here soon!
`
            }
          />
        </Centerer>
      </Screen>
    );
  }
}
