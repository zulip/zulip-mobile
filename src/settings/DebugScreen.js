/* @flow strict-local */

import React, { useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector, useDispatch } from '../react-redux';
import { getSession } from '../selectors';
import { SwitchRow, Screen } from '../common';
import { debugFlagToggle } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'debug'>,
  route: RouteProp<'debug', void>,
|}>;

export default function DebugScreen(props: Props) {
  const dispatch = useDispatch();
  const debug = useSelector(state => getSession(state).debug);

  const handleSettingToggle = useCallback(
    (key: string) => {
      dispatch(debugFlagToggle(key, !debug[key]));
    },
    [debug, dispatch],
  );

  return (
    <Screen title="Debug">
      <SwitchRow
        label="Do not mark messages read on scroll"
        value={debug.doNotMarkMessagesAsRead}
        onValueChange={() => handleSettingToggle('doNotMarkMessagesAsRead')}
      />
    </Screen>
  );
}
