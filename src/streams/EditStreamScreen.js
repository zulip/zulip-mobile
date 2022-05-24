/* @flow strict-local */
import React, { useCallback, useRef } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { useSelector, useDispatch } from '../react-redux';
import { updateExistingStream, navigateBack } from '../actions';
import { getStreamForId } from '../selectors';
import Screen from '../common/Screen';
import EditStreamCard from './EditStreamCard';
import { streamPropsToPrivacy } from './streamsActions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'edit-stream'>,
  route: RouteProp<'edit-stream', {| streamId: number |}>,
|}>;

export default function EditStreamScreen(props: Props): Node {
  const { navigation } = props;
  const dispatch = useDispatch();
  const stream = useSelector(state => getStreamForId(state, props.route.params.streamId));

  // What we pass for EditStreamCard's `initialValues` should be constant.
  const initialValues = useRef({
    name: stream.name,
    description: stream.description,
    privacy: streamPropsToPrivacy(stream),
  }).current;

  const handleComplete = useCallback(
    changedValues => {
      dispatch(updateExistingStream(stream.stream_id, changedValues));
      NavigationService.dispatch(navigateBack());
    },
    [stream, dispatch],
  );

  return (
    <Screen title="Edit stream" padding>
      <EditStreamCard
        navigation={navigation}
        isNewStream={false}
        initialValues={initialValues}
        onComplete={handleComplete}
      />
    </Screen>
  );
}
