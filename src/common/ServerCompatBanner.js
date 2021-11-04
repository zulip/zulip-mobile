/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';

import ZulipBanner from './ZulipBanner';
import { useSelector, useGlobalSelector, useDispatch } from '../react-redux';
import { getIdentity, getServerVersion } from '../account/accountsSelectors';
import { getIsAdmin, getSession, getGlobalSettings } from '../directSelectors';
import { dismissCompatNotice } from '../session/sessionActions';
import { openLinkWithUserPreference } from '../utils/openLink';

// The oldest version we currently support. Should match what we say at
//   https://zulip.readthedocs.io/en/stable/overview/release-lifecycle.html#compatibility-and-upgrading.
const minSupportedVersion = '2.1.0';
// Notes on known breakage at older versions:
//  * Before 1.8, the server doesn't send found_newest / found_oldest on
//    fetching messages, and so `state.caughtUp` will never have truthy
//    values.  This probably means annoying behavior in a message list,
//    as we keep trying to fetch newer messages.

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
  const isAdmin = useSelector(getIsAdmin);
  const settings = useGlobalSelector(getGlobalSettings);

  let visible = false;
  let text = '';
  if (zulipVersion.isAtLeast(minSupportedVersion)) {
    // don't show
  } else if (hasDismissedServerCompatNotice) {
    // don't show
  } else {
    visible = true;
    text = isAdmin
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
          label: 'Dismiss',
          onPress: () => {
            dispatch(dismissCompatNotice());
          },
        },
        {
          id: 'resolve',
          label: isAdmin ? 'Fix now' : 'Learn more',
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
