/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';

import ZulipBanner from './ZulipBanner';
import { useSelector, useGlobalSelector, useDispatch } from '../react-redux';
import { getIdentity, getServerVersion } from '../account/accountsSelectors';
import { getSession, getGlobalSettings } from '../directSelectors';
import { dismissCompatNotice } from '../session/sessionActions';
import { openLinkWithUserPreference } from '../utils/openLink';
import { ZulipVersion } from '../utils/zulipVersion';
import { getOwnUserRole, roleIsAtLeast } from '../permissionSelectors';
import { Role } from '../api/permissionsTypes';

/**
 * The oldest version we currently support.
 *
 * Should match what we say at:
 *   https://zulip.readthedocs.io/en/stable/overview/release-lifecycle.html#compatibility-and-upgrading
 */
// "2.2.0" is a funny way of saying "3.0", differing in that it accepts
// versions like 2.2-dev-1234-g08192a3b4c.  Some servers running versions
// from Git describe their versions that way: specifically those installed
// from commits in the range 2.2-dev..3.0-dev (2019-12 to 2020-06), before
// we decided to rename the then-upcoming release from 2.2 to 3.0; and
// potentially upgraded since then, but not past the upgrader bugfix commit
// 5.0~960 (2022-01).
//
// By the time we want to desupport 3.x circa 2022-11, it should make sense
// to simply say 4.0 here.  By that point the affected versions from Git
// will be nearly a year old, and it's pretty OK to just say those servers
// should upgrade too.
export const kMinSupportedVersion: ZulipVersion = new ZulipVersion('2.2.0');
// Notes on known breakage at older versions:
//  * Before 1.8, the server doesn't send found_newest / found_oldest on
//    fetching messages, and so `state.caughtUp` will never have truthy
//    values.  This probably means annoying behavior in a message list,
//    as we keep trying to fetch newer messages.

/**
 * The next value we'll give to kMinSupportedVersion in the future.
 *
 * This should be the next major Zulip Server version after kMinSupportedVersion.
 */
export const kNextMinSupportedVersion: ZulipVersion = new ZulipVersion('4.0');

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
  const isAtLeastAdmin = useSelector(state => roleIsAtLeast(getOwnUserRole(state), Role.Admin));
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
          text:
            '{realm} is running Zulip Server {serverVersion}, which is unsupported. Please upgrade your server as soon as possible.',
          values: { realm: realm.toString(), serverVersion: zulipVersion.raw() },
        }
      : {
          text:
            '{realm} is running Zulip Server {serverVersion}, which is unsupported. Please contact your administrator about upgrading.',
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
          label: 'Remind me later',
          onPress: () => {
            dispatch(dismissCompatNotice());
          },
        },
        {
          id: 'learn-more',
          label: 'Learn more',
          onPress: () => {
            openLinkWithUserPreference(
              'https://zulip.readthedocs.io/en/stable/overview/release-lifecycle.html#compatibility-and-upgrading',
              settings,
            );
          },
        },
      ]}
    />
  );
}
