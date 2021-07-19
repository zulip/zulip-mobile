/* @flow strict-local */
import React, { useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { createNewStream, navigateBack } from '../actions';
import { getOwnEmail } from '../selectors';
import { Screen } from '../common';
import EditStreamCard from './EditStreamCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'create-stream'>,
  route: RouteProp<'create-stream', void>,

  dispatch: Dispatch,
  ownEmail: string,
|}>;

function CreateStreamScreen(props: Props) {
  const { dispatch, ownEmail } = props;

  const handleComplete = useCallback(
    (name: string, description: string, isPrivate: boolean) => {
      dispatch(createNewStream(name, description, [ownEmail], isPrivate));
      NavigationService.dispatch(navigateBack());
    },
    [ownEmail, dispatch],
  );

  return (
    <Screen title="Create new stream" padding>
      <EditStreamCard
        isNewStream
        initialValues={{ name: '', description: '', invite_only: false }}
        onComplete={handleComplete}
      />
    </Screen>
  );
}

export default connect(state => ({
  ownEmail: getOwnEmail(state),
}))(CreateStreamScreen);
