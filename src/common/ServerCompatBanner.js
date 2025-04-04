/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';

import ZulipBanner from './ZulipBanner';
import { useSelector, useGlobalSelector, useDispatch } from '../react-redux';
import { getOwnUser } from '../selectors';
import { getIdentity, getServerVersion } from '../account/accountsSelectors';
import { getSession, getGlobalSettings } from '../directSelectors';
import { dismissCompatNotice } from '../session/sessionActions';
import { openLinkWithUserPreference } from '../utils/openLink';
import { ZulipVersion } from '../utils/zulipVersion';
import { roleIsAtLeast } from '../permissionSelectors';
import { Role } from '../api/permissionsTypes';

/**
 * The doc stating our oldest supported server version.
 */
// TODO: Instead, link to new Help Center doc once we have it:
//   https://github.com/zulip/zulip/issues/23842
export const kServerSupportDocUrl: URL = new URL(
  'https://zulip.readthedocs.io/en/latest/overview/release-lifecycle.html#compatibility-and-upgrading',
);

/**
 * The oldest version we currently support.
 *
 * Should match the policy stated at kServerSupportDocUrl: all versions
 * below this should be older than 18 months.
 *
 * See also kMinAllowedServerVersion in apiErrors.js, for the version below
 * which we just refuse to connect.
 */
export const kMinSupportedVersion: ZulipVersion = new ZulipVersion('7.0');

/**
 * The next value we'll give to kMinSupportedVersion in the future.
 *
 * This should be the next major Zulip Server version after kMinSupportedVersion.
 */
export const kNextMinSupportedVersion: ZulipVersion = new ZulipVersion('8.0');

type Props = $ReadOnly<{||}>;

/**
 * A "nag banner" saying the server version is unsupported, if so.
 */
export default function ServerCompatBanner(props: Props): Node {
  const dispatch = useDispatch();
  const hasDismissedServerCompatNotice = useSelector(
    state => getSession(state).hasDismissedServerCompatNotice,
  );
  const zulipVersion = useSelector(getServerVersion);
  const realm = useSelector(state => getIdentity(state).realm);
  const isAtLeastAdmin = useSelector(state => roleIsAtLeast(getOwnUser(state).role, Role.Admin));
  const settings = useGlobalSelector(getGlobalSettings);

  let visible = false;
  let text = '';
  if (zulipVersion.isAtLeast(kMinSupportedVersion)) {
    // don't show
  } else if (hasDismissedServerCompatNotice) {
    // don't show
  } else {
    visible = true;
    text = isAtLeastAdmin
      ? {
          text: '{realm} is running Zulip Server {serverVersion}, which is unsupported. Please upgrade your server as soon as possible.',
          values: { realm: realm.toString(), serverVersion: zulipVersion.raw() },
        }
      : {
          text: '{realm} is running Zulip Server {serverVersion}, which is unsupported. Please contact your administrator about upgrading.',
          values: { realm: realm.toString(), serverVersion: zulipVersion.raw() },
        };
  }

  return (
    <ZulipBanner
      visible={visible}
      text={text}
      buttons={[
        {
          id: 'dismiss',
          label: 'Dismiss',
          onPress: () => {
            dispatch(dismissCompatNotice());
          },
        },
        {
          id: 'learn-more',
          label: 'Learn more',
          onPress: () => {
            openLinkWithUserPreference(kServerSupportDocUrl, settings);
          },
        },
      ]}
    />
  );
}
