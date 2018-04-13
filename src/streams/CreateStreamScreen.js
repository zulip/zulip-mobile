/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import EditStreamContainer from './EditStreamContainer';

export default class CreateStreamScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Create new stream" padding keyboardShouldPersistTaps="handled">
        <EditStreamContainer />
      </Screen>
    );
  }
}
