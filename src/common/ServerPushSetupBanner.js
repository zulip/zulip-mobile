/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import subWeeks from 'date-fns/subWeeks';

import ZulipBanner from './ZulipBanner';
import { useSelector, useGlobalSelector, useDispatch } from '../react-redux';
import { getIdentity, getAccount } from '../account/accountsSelectors';
import { getRealm, getGlobalSettings } from '../directSelectors';
import { dismissServerPushSetupNotice } from '../account/accountActions';
import { openLinkWithUserPreference } from '../utils/openLink';
import { getOwnUserRole, roleIsAtLeast } from '../permissionSelectors';
import { Role } from '../api/permissionsTypes';

type Props = $ReadOnly<{|
  isDismissable?: boolean,
|}>;

/**
 * A "nag banner" saying the server hasn't enabled push notifications, if so
 *
 * If `isDismissable` is false, the banner is always visible unless the
 * server is set up for push notifications.
 *
 * Otherwise, it offers a dismiss button. If this notice is dismissed, it
 * sleeps for two weeks, then reappears if the server hasn't gotten set up
 * for push notifications in that time. ("This notice" means the currently
 * applicable notice. If the server does get setup for push notifications,
 * then gets un-setup, a new notice will apply.)
 */
export default function PushNotifsSetupBanner(props: Props): Node {
  const { isDismissable = true } = props;

  const dispatch = useDispatch();

  const lastDismissedServerPushSetupNotice = useSelector(
    state => getAccount(state).lastDismissedServerPushSetupNotice,
  );
  const pushNotificationsEnabled = useSelector(state => getRealm(state).pushNotificationsEnabled);
  const realm = useSelector(state => getIdentity(state).realm);
  const isAtLeastAdmin = useSelector(state => roleIsAtLeast(getOwnUserRole(state), Role.Admin));
  const settings = useGlobalSelector(getGlobalSettings);

  let visible = false;
  let text = '';
  if (pushNotificationsEnabled) {
    // don't show
  } else if (
    isDismissable
    && lastDismissedServerPushSetupNotice !== null
    // TODO: Could rerender this component on an interval, to give an
    //   upper bound on how outdated this `new Date()` can be.
    && lastDismissedServerPushSetupNotice >= subWeeks(new Date(), 2)
  ) {
    // don't show
  } else {
    visible = true;
    text = isAtLeastAdmin
      ? {
          text: 'The Zulip server at {realm} is not set up to deliver push notifications. Please contact your administrator.',
          values: { realm: realm.toString() },
        }
      : {
          text: 'The Zulip server at {realm} is not set up to deliver push notifications.',
          values: { realm: realm.toString() },
        };
  }

  const buttons = [];
  if (isDismissable) {
    buttons.push({
      id: 'dismiss',
      label: 'Remind me later',
      onPress: () => {
        dispatch(dismissServerPushSetupNotice());
      },
    });
  }
  buttons.push({
    id: 'learn-more',
    label: 'Learn more',
    onPress: () => {
      openLinkWithUserPreference(
        'https://zulip.readthedocs.io/en/stable/production/mobile-push-notifications.html',
        settings,
      );
    },
  });

  return <ZulipBanner visible={visible} text={text} buttons={buttons} />;
}
