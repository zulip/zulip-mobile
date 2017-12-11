/* @flow */
import React, { PureComponent } from 'react';

import type { Actions } from '../types';
import { Screen } from '../common';
import EditStreamContainer from './EditStreamContainer';

type Props = {
  actions: Actions,
};

export default class EditStreamScreen extends PureComponent<Props> {
  props: Props;

  handleEditScreen = (name: string, description: string, isPrivate: boolean) => {
    const { actions } = this.props;

    actions.updateExistingStream(name, description, isPrivate);
    actions.navigateBack();
  };

  render() {
    return (
      <Screen title="Edit stream" padding>
        <EditStreamContainer onUpdate={this.handleEditScreen} />
      </Screen>
    );
  }
}
