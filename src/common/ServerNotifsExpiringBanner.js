/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import subDays from 'date-fns/subDays';

import ZulipBanner from './ZulipBanner';
import { useSelector, useDispatch, useGlobalSelector } from '../react-redux';
import { getAccount, getSilenceServerPushSetupWarnings } from '../account/accountsSelectors';
import { dismissServerNotifsExpiringBanner } from '../account/accountActions';
import {
  kPushNotificationsEnabledEndDoc,
  pushNotificationsEnabledEndTimestampWarning,
} from '../settings/NotifTroubleshootingScreen';
import { useDateRefreshedAtInterval } from '../reactUtils';
import { openLinkWithUserPreference } from '../utils/openLink';
import { getGlobalSettings } from '../directSelectors';

type Props = $ReadOnly<{||}>;

/**
 * A "nag banner" saying the server will soon disable notifications, if so.
 *
 * Offers a dismiss button. If this notice is dismissed, it sleeps for a
 * week, then reappears if the warning still applies.
 */
export default function ServerNotifsExpiringBanner(props: Props): Node {
  const dispatch = useDispatch();

  const globalSettings = useGlobalSelector(getGlobalSettings);

  const lastDismissedServerNotifsExpiringBanner = useSelector(
    state => getAccount(state).lastDismissedServerNotifsExpiringBanner,
  );

  const perAccountState = useSelector(state => state);
  const dateNow = useDateRefreshedAtInterval(60_000);

  const expiryWarning = pushNotificationsEnabledEndTimestampWarning(perAccountState, dateNow);

  const silenceServerPushSetupWarnings = useSelector(getSilenceServerPushSetupWarnings);

  let visible = false;
  let text = '';
  if (expiryWarning == null) {
    // don't show
  } else if (silenceServerPushSetupWarnings) {
    // don't show
  } else if (
    lastDismissedServerNotifsExpiringBanner !== null
    && lastDismissedServerNotifsExpiringBanner >= subDays(dateNow, 8)
  ) {
    // don't show
  } else {
    visible = true;
    text = expiryWarning.reactText;
  }

  const buttons = [];
  buttons.push({
    id: 'dismiss',
    label: 'Dismiss',
    onPress: () => {
      dispatch(dismissServerNotifsExpiringBanner());
    },
  });
  buttons.push({
    id: 'learn-more',
    label: 'Learn more',
    onPress: () => {
      openLinkWithUserPreference(kPushNotificationsEnabledEndDoc, globalSettings);
    },
  });

  return <ZulipBanner visible={visible} text={text} buttons={buttons} />;
}
