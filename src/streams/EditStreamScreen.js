/* @flow strict-local */
import React, { useCallback } from 'react';

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

function EditStreamScreen(props: Props) {
  const { dispatch, stream } = props;

  const handleComplete = useCallback(
    (name: string, description: string, isPrivate: boolean) => {
      dispatch(updateExistingStream(stream.stream_id, stream, { name, description, isPrivate }));
      NavigationService.dispatch(navigateBack());
    },
    [stream, dispatch],
  );

  return (
    <Screen title="Edit stream" padding>
      <EditStreamCard
        isNewStream={false}
        initialValues={{
          name: stream.name,
          description: stream.description,
          invite_only: stream.invite_only,
        }}
        onComplete={handleComplete}
      />
    </Screen>
  );
}

export default connect<SelectorProps, _, _>((state, props) => ({
  stream: getStreamForId(state, props.route.params.streamId),
}))(EditStreamScreen);
