/* @flow */
import React, { PureComponent } from 'react';
import type { NavigationScreenProp } from 'react-navigation';

import { Screen } from '../common';
import EditStreamContainer from './EditStreamContainer';

type Props = {
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        streamId: number,
      },
    },
  },
};

export default class EditStreamScreen extends PureComponent<Props> {
  render() {
    return (
      <Screen title="Edit stream" padding>
        <EditStreamContainer streamId={this.props.navigation.state.params.streamId} />
      </Screen>
    );
  }
}
