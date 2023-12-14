/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import subWeeks from 'date-fns/subWeeks';

import ZulipBanner from './ZulipBanner';
import { useSelector, useDispatch } from '../react-redux';
import { getAccount, getSilenceServerPushSetupWarnings } from '../account/accountsSelectors';
import { getRealm } from '../directSelectors';
import { getRealmName } from '../selectors';
import { dismissServerPushSetupNotice } from '../account/accountActions';
import {
  NotificationProblem,
  notifProblemShortReactText,
} from '../settings/NotifTroubleshootingScreen';
import type { AppNavigationMethods } from '../nav/AppNavigator';

type Props = $ReadOnly<{|
  navigation: AppNavigationMethods,
|}>;

/**
 * A "nag banner" saying the server hasn't enabled push notifications, if so
 *
 * Offers a dismiss button. If this notice is dismissed, it sleeps for two
 * weeks, then reappears if the server hasn't gotten set up for push
 * notifications in that time. ("This notice" means the currently applicable
 * notice. If the server does get setup for push notifications, then gets
 * un-setup, a new notice will apply.)
 */
export default function ServerPushSetupBanner(props: Props): Node {
  const { navigation } = props;

  const dispatch = useDispatch();

  const lastDismissedServerPushSetupNotice = useSelector(
    state => getAccount(state).lastDismissedServerPushSetupNotice,
  );
  const pushNotificationsEnabled = useSelector(state => getRealm(state).pushNotificationsEnabled);
  const silenceServerPushSetupWarnings = useSelector(getSilenceServerPushSetupWarnings);
  const realmName = useSelector(getRealmName);

  let visible = false;
  let text = '';
  if (pushNotificationsEnabled) {
    // don't show
  } else if (silenceServerPushSetupWarnings) {
    // don't show
  } else if (
    lastDismissedServerPushSetupNotice !== null
    // TODO: Could rerender this component on an interval, to give an
    //   upper bound on how outdated this `new Date()` can be.
    && lastDismissedServerPushSetupNotice >= subWeeks(new Date(), 2)
  ) {
    // don't show
  } else {
    visible = true;
    text = notifProblemShortReactText(NotificationProblem.ServerHasNotEnabled, realmName);
  }

  const buttons = [];
  buttons.push({
    id: 'dismiss',
    label: 'Dismiss',
    onPress: () => {
      dispatch(dismissServerPushSetupNotice());
    },
  });
  buttons.push({
    id: 'learn-more',
    label: 'Learn more',
    onPress: () => {
      dispatch(dismissServerPushSetupNotice());
      navigation.push('notifications');
    },
  });

  return <ZulipBanner visible={visible} text={text} buttons={buttons} />;
}
