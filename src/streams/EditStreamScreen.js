/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { useSelector, useDispatch } from '../react-redux';
import { updateExistingStream, navigateBack } from '../actions';
import { getStreamForId } from '../selectors';
import { showToast } from '../utils/info';
import Screen from '../common/Screen';
import EditStreamCard from './EditStreamCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'edit-stream'>,
  route: RouteProp<'edit-stream', {| streamId: number |}>,
|}>;

export default function EditStreamScreen(props: Props): Node {
  const dispatch = useDispatch();
  const stream = useSelector(state => getStreamForId(state, props.route.params.streamId));

  const handleComplete = useCallback(
    async (name: string, description: string, isPrivate: boolean) => {
      try {
        await dispatch(
          updateExistingStream(stream.stream_id, stream, { name, description, isPrivate }),
        );
      } catch (error) {
        showToast(error.message);
      }
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
