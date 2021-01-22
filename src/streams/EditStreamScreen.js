/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { AppNavigationProp, AppNavigationRouteProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
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
  navigation: AppNavigationProp<'edit-stream'>,
  route: AppNavigationRouteProp<'edit-stream'>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class EditStreamScreen extends PureComponent<Props> {
  handleComplete = (name: string, description: string, isPrivate: boolean) => {
    const { dispatch, stream } = this.props;

    dispatch(updateExistingStream(stream.stream_id, stream, { name, description, isPrivate }));
    NavigationService.dispatch(navigateBack());
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
  stream: getStreamForId(state, props.route.params.streamId),
}))(EditStreamScreen);
