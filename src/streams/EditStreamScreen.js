/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import type { Dispatch, Stream } from '../types';
import { connect } from '../react-redux';
import { updateExistingStream, navigateBack } from '../actions';
import { getStreamForId } from '../selectors';
import { Screen } from '../common';
import EditStreamCard from './EditStreamCard';

type SelectorProps = $ReadOnly<{|
  stream: Stream,
|}>;

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<{|
    ...NavigationStateRoute,
    params: {| streamId: number |},
  |}>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

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

export default connect<SelectorProps, _, _>((state, props) => ({
  stream: getStreamForId(state, props.navigation.state.params.streamId),
}))(EditStreamScreen);
