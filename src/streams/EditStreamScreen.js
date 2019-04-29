/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { NavigationScreenProp } from 'react-navigation';

import type { InjectedDispatch, Stream } from '../types';
import { connectFlowFixMe } from '../react-redux';
import { updateExistingStream, navigateBack } from '../actions';
import { getStreamForId } from '../selectors';
import { Screen } from '../common';
import EditStreamCard from './EditStreamCard';

type OwnProps = {|
  navigation: NavigationScreenProp<{ params: {| streamId: number |} }>,
|};

type SelectorProps = {|
  stream: Stream,
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
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

export default connectFlowFixMe((state, props: OwnProps): SelectorProps => ({
  stream: getStreamForId(state, props.navigation.state.params.streamId),
}))(EditStreamScreen);
