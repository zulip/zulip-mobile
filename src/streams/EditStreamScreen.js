/* @flow strict-local */
import React, { useCallback, useRef, useContext } from 'react';
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
import { ApiError } from '../api/apiErrors';
import { showErrorAlert } from '../utils/info';
import { TranslationContext } from '../boot/TranslationProvider';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'edit-stream'>,
  route: RouteProp<'edit-stream', {| streamId: number |}>,
|}>;

export default function EditStreamScreen(props: Props): Node {
  const { navigation } = props;
  const dispatch = useDispatch();
  const stream = useSelector(state => getStreamForId(state, props.route.params.streamId));
  const _ = useContext(TranslationContext);

  // What we pass for EditStreamCard's `initialValues` should be constant.
  const initialValues = useRef({
    name: stream.name,
    description: stream.description,
    privacy: streamPropsToPrivacy(stream),
  }).current;

  const handleComplete = useCallback(
    async changedValues => {
      try {
        await dispatch(updateExistingStream(stream.stream_id, changedValues));
        NavigationService.dispatch(navigateBack());
      } catch (errorIllTyped) {
        const error: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
        if (error instanceof ApiError) {
          showErrorAlert(
            _('Cannot apply requested settings'),
            // E.g., "Must be an organization or stream administrator", with
            // code UNAUTHORIZED_PRINCIPAL, when trying to change an
            // existing stream's privacy setting when unauthorized. The
            // server could be more specific with this error.
            error.message,
          );
        } else {
          throw error;
        }
      }
    },
    [stream, dispatch, _],
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
