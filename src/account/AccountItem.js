/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Alert, Pressable, View } from 'react-native';
// $FlowFixMe[untyped-import]
import Color from 'color';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { IconAlertTriangle, IconDone, IconTrash } from '../common/Icons';
import { useGlobalDispatch, useGlobalSelector } from '../react-redux';
import { getIsActiveAccount, tryGetActiveAccountState } from './accountsSelectors';
import type { AccountStatus } from './AccountPickScreen';
import { kWarningColor } from '../styles/constants';
import { TranslationContext } from '../boot/TranslationProvider';
import { accountSwitch } from './accountActions';
import { useNavigation } from '../react-navigation';
import {
  chooseNotifProblemForShortText,
  notifProblemShortText,
} from '../settings/NotifTroubleshootingScreen';
import { getRealmName } from '../directSelectors';
import { getHaveServerData } from '../haveServerDataSelectors';

const styles = createStyleSheet({
  wrapper: {
    justifyContent: 'space-between',
  },
  accountItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
  },
  selectedAccountItem: {
    borderColor: BRAND_COLOR,
    borderWidth: 1,
  },
  details: {
    flex: 1,
  },
  text: {
    fontWeight: 'bold',
    marginVertical: 2,
  },
  icon: {
    marginLeft: 24,
  },
  signedOutText: {
    fontStyle: 'italic',
    color: 'gray',
    marginVertical: 2,
  },
});

type Props = $ReadOnly<{|
  account: AccountStatus,
  onSelect: AccountStatus => Promise<void> | void,
  onRemove: AccountStatus => Promise<void> | void,
|}>;

export default function AccountItem(props: Props): Node {
  const { email, realm, isLoggedIn, notificationReport, silenceServerPushSetupWarnings } =
    props.account;

  const _ = React.useContext(TranslationContext);
  const navigation = useNavigation();
  const dispatch = useGlobalDispatch();

  const isActiveAccount = useGlobalSelector(state => getIsActiveAccount(state, { email, realm }));

  // Don't show the "remove account" button (the "trash" icon) for the
  // active account when it's logged in.  This prevents removing it when the
  // main app UI, relying on that account's data, may be on the nav stack.
  // See `getHaveServerData`.
  const showDoneIcon = isActiveAccount && isLoggedIn;

  const backgroundItemColor = isLoggedIn ? 'hsla(177, 70%, 47%, 0.1)' : 'hsla(0,0%,50%,0.1)';
  const textColor = isLoggedIn ? BRAND_COLOR : 'gray';

  const activeAccountState = useGlobalSelector(tryGetActiveAccountState);
  // The fallback text '(unknown organization name)' is never expected to
  // appear in the UI. As of writing, notifProblemShortText doesn't use its
  // realmName param except for a NotificationProblem which we only select
  // when we have server data for the relevant account. When we have that,
  // `realmName` will be the real realm name, not the fallback.
  // TODO(#5005) look for server data even when this item's account is not
  //   the active one.
  const realmName =
    isActiveAccount && activeAccountState != null && getHaveServerData(activeAccountState)
      ? getRealmName(activeAccountState)
      : '(unknown organization name)';
  const singleNotifProblem = chooseNotifProblemForShortText({
    report: notificationReport,
    ignoreServerHasNotEnabled: silenceServerPushSetupWarnings,
  });

  const handlePressNotificationWarning = React.useCallback(() => {
    if (singleNotifProblem == null) {
      return;
    }
    Alert.alert(
      _('Notifications'),
      _(notifProblemShortText(singleNotifProblem, realmName)),
      [
        { text: _('Cancel'), style: 'cancel' },
        {
          text: _('Details'),
          onPress: () => {
            dispatch(accountSwitch({ realm, email }));
            navigation.push('notifications');
          },
          style: 'default',
        },
      ],
      { cancelable: true },
    );
  }, [email, singleNotifProblem, realm, realmName, navigation, dispatch, _]);

  return (
    <Touchable style={styles.wrapper} onPress={() => props.onSelect(props.account)}>
      <View
        style={[
          styles.accountItem,
          showDoneIcon && styles.selectedAccountItem,
          { backgroundColor: backgroundItemColor },
        ]}
      >
        <View style={styles.details}>
          <ZulipText style={[styles.text, { color: textColor }]} text={email} numberOfLines={1} />
          <ZulipText
            style={[styles.text, { color: textColor }]}
            text={realm.toString()}
            numberOfLines={1}
          />
          {!isLoggedIn && (
            <ZulipTextIntl style={styles.signedOutText} text="Signed out" numberOfLines={1} />
          )}
        </View>
        {singleNotifProblem != null && (
          <Pressable style={styles.icon} hitSlop={12} onPress={handlePressNotificationWarning}>
            {({ pressed }) => (
              <IconAlertTriangle
                size={24}
                color={pressed ? Color(kWarningColor).fade(0.5).toString() : kWarningColor}
              />
            )}
          </Pressable>
        )}
        {!showDoneIcon ? (
          <Pressable style={styles.icon} hitSlop={12} onPress={() => props.onRemove(props.account)}>
            {({ pressed }) => (
              <IconTrash
                size={24}
                color={pressed ? Color('crimson').fade(0.5).toString() : 'crimson'}
              />
            )}
          </Pressable>
        ) : (
          <IconDone style={styles.icon} size={24} color={BRAND_COLOR} />
        )}
      </View>
    </Touchable>
  );
}
