/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Dispatch } from '../types';
import { updateExistingStream, navigateBack } from '../actions';
import { getStreamIdFromParams, getStreamFromParams } from '../selectors';
import { Screen } from '../common';
import EditStreamCard from './EditStreamCard';

type Props = {
  dispatch: Dispatch,
  initialValues: {
    name: string,
    description: string,
    invite_only: boolean,
  },
  streamId: number,
};

class EditStreamScreen extends PureComponent<Props> {
  props: Props;

  handleComplete = (name: string, description: string, isPrivate: boolean) => {
    const { dispatch, streamId, initialValues } = this.props;

    dispatch(updateExistingStream(streamId, initialValues, { name, description, isPrivate }));
    dispatch(navigateBack());
  };

  render() {
    const { initialValues } = this.props;

    return (
      <Screen title="Edit stream" padding>
        <EditStreamCard
          isNewStream={false}
          initialValues={initialValues}
          onComplete={this.handleComplete}
        />
      </Screen>
    );
  }
}

export default connect(state => ({
  initialValues: getStreamFromParams(state),
  streamId: getStreamIdFromParams(state).streamId,
}))(EditStreamScreen);
