/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import subWeeks from 'date-fns/subWeeks';

import ZulipBanner from './ZulipBanner';
import { useSelector, useGlobalSelector, useDispatch } from '../react-redux';
import { getIdentity, getAccount } from '../account/accountsSelectors';
import { getIsAdmin, getRealm, getGlobalSettings } from '../directSelectors';
import { dismissServerPushSetupNotice } from '../account/accountActions';
import { openLinkWithUserPreference } from '../utils/openLink';

type Props = $ReadOnly<{||}>;

/**
 * A "nag banner" saying the server hasn't enabled push notifications, if so
 *
 * When dismissed, reappears again in two weeks.
 */
export default function PushNotifsSetupBanner(props: Props): Node {
  const dispatch = useDispatch();
  const lastDismissedServerPushSetupNotice = useSelector(
    state => getAccount(state).lastDismissedServerPushSetupNotice,
  );
  const pushNotificationsEnabled = useSelector(state => getRealm(state).pushNotificationsEnabled);
  const realm = useSelector(state => getIdentity(state).realm);
  const isAdmin = useSelector(getIsAdmin);
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
    text = isAdmin
      ? {
          text:
            'The Zulip server at {realm} is not set up to deliver push notifications. Please contact your administrator.',
          values: { realm: realm.toString() },
        }
      : {
          text: 'The Zulip server at {realm} is not set up to deliver push notifications.',
          values: { realm: realm.toString() },
        };
  }

  return (
    <ZulipBanner
      visible={visible}
      text={text}
      buttons={[
        {
          id: 'dismiss',
          label: 'Remind me later',
          onPress: () => {
            dispatch(dismissServerPushSetupNotice());
          },
        },
        {
          id: 'learn-more',
          label: 'Learn more',
          onPress: () => {
            openLinkWithUserPreference(
              'https://zulip.readthedocs.io/en/stable/production/mobile-push-notifications.html',
              settings,
            );
          },
        },
      ]}
    />
  );
}
