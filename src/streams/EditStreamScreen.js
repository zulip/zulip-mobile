/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
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
  route: RouteProp<'edit-stream', {| streamId: number |}>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

/**
 * A screen for editing a stream.
 *
 * Needs to occupy the horizontal insets because `EditStreamCard` does.
 */
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
          initialValues={{
            name: stream.name,
            description: stream.description,
            invite_only: stream.invite_only,
          }}
          onComplete={this.handleComplete}
        />
      </Screen>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  stream: getStreamForId(state, props.route.params.streamId),
}))(EditStreamScreen);
