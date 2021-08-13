/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyleSheet, HALF_COLOR } from '../styles';
import { useSelector, useDispatch } from '../react-redux';
import Label from './Label';
import { getActiveAccount } from '../account/accountsSelectors';
import { getIsAdmin, getSession, getSettings } from '../directSelectors';
import { dismissCompatNotice } from '../session/sessionActions';
import ZulipTextButton from './ZulipTextButton';
import { openLinkWithUserPreference } from '../utils/openLink';

// In fact the oldest version we currently support is 2.1.0, per our docs:
//   https://zulip.readthedocs.io/en/4.2/overview/release-lifecycle.html
// For now we only show this banner for servers older than 2.0.0, though,
// in order to phase that in gradually.
const minSupportedVersion = '2.0.0';

const styles = createStyleSheet({
  wrapper: {
    backgroundColor: HALF_COLOR,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  textRow: {
    flexDirection: 'row',
  },
  text: {
    marginTop: 16,
    lineHeight: 20,
  },
  buttonsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

type Props = $ReadOnly<{||}>;

/**
 * A "nag banner" saying the server version is unsupported, if so.
 *
 * Pads the horizontal insets with its background.
 */
// Made with somewhat careful attention to
// https://material.io/components/banners. Please consult that before making
// layout changes, and try to make them in a direction that brings us closer
// to those guidelines.
export default function ServerCompatBanner(props: Props): Node {
  const dispatch = useDispatch();
  const hasDismissedServerCompatNotice = useSelector(
    state => getSession(state).hasDismissedServerCompatNotice,
  );
  const zulipVersion = useSelector(state => getActiveAccount(state).zulipVersion);
  const realm = useSelector(state => getActiveAccount(state).realm);
  const isAdmin = useSelector(getIsAdmin);
  const settings = useSelector(getSettings);

  if (!zulipVersion || zulipVersion.isAtLeast(minSupportedVersion)) {
    return null;
  } else if (hasDismissedServerCompatNotice) {
    return null;
  }

  return (
    <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.wrapper}>
      <View style={styles.textRow}>
        <Label
          style={styles.text}
          text={
            isAdmin
              ? {
                  text:
                    '{realm} is running Zulip Server {serverVersion}, which is unsupported. Please upgrade your server as soon as possible.',
                  values: { realm: realm.toString(), serverVersion: zulipVersion.raw() },
                }
              : {
                  text:
                    '{realm} is running Zulip Server {serverVersion}, which is unsupported. Please contact your administrator about upgrading.',
                  values: { realm: realm.toString(), serverVersion: zulipVersion.raw() },
                }
          }
        />
      </View>
      <View style={styles.buttonsRow}>
        <ZulipTextButton
          label="Dismiss"
          onPress={() => {
            dispatch(dismissCompatNotice());
          }}
        />
        <ZulipTextButton
          leftMargin
          label={isAdmin ? 'Fix now' : 'Learn more'}
          onPress={() => {
            openLinkWithUserPreference(
              'https://zulip.readthedocs.io/en/stable/overview/release-lifecycle.html#compatibility-and-upgrading',
              settings,
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
