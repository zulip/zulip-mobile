/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import subWeeks from 'date-fns/subWeeks';

import ZulipBanner from './ZulipBanner';
import { useSelector, useGlobalSelector, useDispatch } from '../react-redux';
import { getAccount } from '../account/accountsSelectors';
import { getRealm, getGlobalSettings } from '../directSelectors';
import { getRealmName } from '../selectors';
import { dismissServerPushSetupNotice } from '../account/accountActions';
import { openLinkWithUserPreference } from '../utils/openLink';
import ZulipText from './ZulipText';

type Props = $ReadOnly<{||}>;

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
  const dispatch = useDispatch();

  const lastDismissedServerPushSetupNotice = useSelector(
    state => getAccount(state).lastDismissedServerPushSetupNotice,
  );
  const pushNotificationsEnabled = useSelector(state => getRealm(state).pushNotificationsEnabled);
  const realmName = useSelector(getRealmName);
  const settings = useGlobalSelector(getGlobalSettings);

  let visible = false;
  let text = '';
  if (pushNotificationsEnabled) {
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
    text = {
      text: 'Push notifications are not enabled for {realmName}.',
      values: {
        realmName: (
          <ZulipText inheritColor inheritFontSize style={{ fontWeight: 'bold' }} text={realmName} />
        ),
      },
    };
  }

  const buttons = [];
  buttons.push({
    id: 'dismiss',
    label: 'Remind me later',
    onPress: () => {
      dispatch(dismissServerPushSetupNotice());
    },
  });
  buttons.push({
    id: 'learn-more',
    label: 'Learn more',
    onPress: () => {
      openLinkWithUserPreference(
        new URL('https://zulip.readthedocs.io/en/stable/production/mobile-push-notifications.html'),
        settings,
      );
    },
  });

  return <ZulipBanner visible={visible} text={text} buttons={buttons} />;
}
