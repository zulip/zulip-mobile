/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import CreateStreamContainer from './CreateStreamContainer';

export default class StreamScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Create new stream" padding>
        <CreateStreamContainer />
      </Screen>
    );
  }
}
