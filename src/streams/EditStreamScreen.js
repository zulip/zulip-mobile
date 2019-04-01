/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState, Stream } from '../types';
import { updateExistingStream, navigateBack } from '../actions';
import { getStreamFromId } from '../selectors';
import { Screen } from '../common';
import EditStreamCard from './EditStreamCard';

type OwnProps = {|
  navigation: Object,
|};

type StateProps = {|
  dispatch: Dispatch,
  stream: Stream,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
|};

class EditStreamScreen extends PureComponent<Props> {
  handleComplete = (name: string, description: string, isPrivate: boolean) => {
    const { dispatch, stream } = this.props;

    dispatch(updateExistingStream(stream.stream_id, stream, { name, description, isPrivate }));
    dispatch(navigateBack());
  };

  render() {
    const { stream } = this.props;

    return (
      <Screen title="Edit stream" padding>
        <EditStreamCard
          isNewStream={false}
          initialValues={stream}
          onComplete={this.handleComplete}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState, props: OwnProps) => ({
  stream: getStreamFromId(state, props.navigation.state.params.streamId),
}))(EditStreamScreen);
