/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';

import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { useSelector } from '../react-redux';
import { navigateBack } from '../actions';
import { getAuth } from '../selectors';
import { getStreamsByName } from '../subscriptions/subscriptionSelectors';
import Screen from '../common/Screen';
import EditStreamCard from './EditStreamCard';
import { showErrorAlert } from '../utils/info';
import { ApiError } from '../api/apiErrors';
import * as api from '../api';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'create-stream'>,
  route: RouteProp<'create-stream', void>,
|}>;

export default function CreateStreamScreen(props: Props): Node {
  const _ = useContext(TranslationContext);

  const auth = useSelector(getAuth);
  const streamsByName = useSelector(getStreamsByName);

  const handleComplete = useCallback(
    async (name, description, privacy) => {
      // This will miss existing streams that the client can't know about;
      // for example, a private stream the user can't access. See comment
      // where we catch an `ApiError`, below.
      if (streamsByName.has(name)) {
        showErrorAlert(_('A stream with this name already exists.'));
        return;
      }

      try {
        await api.createStream(auth, { name, description, invite_only: privacy === 'private' });
        NavigationService.dispatch(navigateBack());
      } catch (error) {
        // If the stream already exists but you can't access it (e.g., it's
        // private), then it won't be in the client's data structures, so
        // our client-side check above won't stop the request from being
        // made. In that case, we expect the server to always give an error,
        // because you can't subscribe to a stream that you can't access.
        // That error will have:
        // - error.message: `Unable to access stream (${streamName})`, or a
        //   translation of that into the user's own language
        // - error.code: "BAD_REQUEST" (as of server feature level 126;
        //   possibly the server should be more specific)
        if (error instanceof ApiError) {
          showErrorAlert(error.message);
        }
      }
    },
    [auth, streamsByName, _],
  );

  return (
    <Screen title="Create new stream" padding>
      <EditStreamCard
        isNewStream
        initialValues={{ name: '', description: '', privacy: 'public' }}
        onComplete={handleComplete}
      />
    </Screen>
  );
}
