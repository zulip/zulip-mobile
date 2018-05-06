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
              "Zulip combines the immediacy of Slack with an email threading model. With Zulip, you can catch up on important conversations while ignoring irrelevant ones.\n\nNew to Zulip? You'll need to first create an account from your computer.\n\nIf you're not sure where to start, go to zulipchat.com from your web browser.\n\nHope to see you back here soon!"
            }
          />
        </Centerer>
      </Screen>
    );
  }
}
