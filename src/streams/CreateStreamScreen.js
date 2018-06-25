/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState } from '../types';
import { createNewStream, navigateBack } from '../actions';
import { getOwnEmail } from '../selectors';
import { Screen } from '../common';
import EditStreamCard from './EditStreamCard';

type Props = {
  dispatch: Dispatch,
  ownEmail: string,
};

class CreateStreamScreen extends PureComponent<Props> {
  props: Props;

  handleComplete = (name: string, description: string, isPrivate: boolean) => {
    const { dispatch, ownEmail } = this.props;

    dispatch(createNewStream(name, description, [ownEmail], isPrivate));
    dispatch(navigateBack());
  };

  render() {
    return (
      <Screen title="Create new stream" padding>
        <EditStreamCard
          isNewStream
          initialValues={{ name: '', description: '', invite_only: false }}
          onComplete={this.handleComplete}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  ownEmail: getOwnEmail(state),
}))(CreateStreamScreen);
