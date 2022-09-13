/* @flow strict-local */

import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useFetchedDataWithRefresh from '../common/useFetchedDataWithRefresh';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { useGlobalSelector, useSelector } from '../react-redux';
import * as api from '../api';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import { useConditionalEffect, useHasNotChangedForMs, useHasStayedTrueForMs } from '../reactUtils';
import { getAuth, getZulipFeatureLevel } from '../account/accountsSelectors';
import { showToast } from '../utils/info';
import { TranslationContext } from '../boot/TranslationProvider';
import UserItem from '../users/UserItem';
import { tryGetUserForId } from '../users/userSelectors';
import type { UserId } from '../api/idTypes';
import { getGlobalSettings } from '../directSelectors';
import type { UserOrBot } from '../api/modelTypes';
import LoadingIndicator from '../common/LoadingIndicator';
import WebLink from '../common/WebLink';
import { createStyleSheet } from '../styles';
import ZulipText from '../common/ZulipText';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'read-receipts'>,
  route: RouteProp<'read-receipts', {| +messageId: number |}>,
|}>;

export default function ReadReceiptsScreen(props: Props): Node {
  const { navigation } = props;
  const { messageId } = props.route.params;

  const auth = useSelector(getAuth);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const language = useGlobalSelector(state => getGlobalSettings(state).language);
  const _ = useContext(TranslationContext);

  const callApiMethod = useCallback(
    () => api.getReadReceipts(auth, { message_id: messageId }, zulipFeatureLevel),
    [auth, messageId, zulipFeatureLevel],
  );

  const { latestResult, latestSuccessResult } = useFetchedDataWithRefresh(callApiMethod, 15_000);

  // TODO: These vanishing toasts are easy to miss. Instead, show
  //   latestResultIsError, isFirstLoadLate, and haveStaleData with
  //   something more persistent. A Material Design Snackbar that stays
  //   until the user dismisses it or the problem resolves?
  //     https://callstack.github.io/react-native-paper/snackbar.html

  const latestResultIsError = latestResult?.type === 'error';
  useConditionalEffect(
    useCallback(() => {
      showToast(_('Could not load data.'));
    }, [_]),
    latestResultIsError,
  );

  const isFirstLoadLate = useHasStayedTrueForMs(latestSuccessResult === null, 10_000);
  useConditionalEffect(
    useCallback(() => showToast(_('Still working…')), [_]),
    isFirstLoadLate
      // If the latest result was an error, we would've shown a "Could not
      // load data" message, which sounds final. Reduce confusion by
      // suppressing a "Still working…" message, even as the Hook continues
      // to try to load the data. Confusion, and also false hope: if the
      // last fetch failed, we're not optimistic about this one.
      && !latestResultIsError,
  );

  const haveStaleData =
    useHasNotChangedForMs(latestSuccessResult, 40_000) && latestSuccessResult !== null;
  useConditionalEffect(
    useCallback(() => showToast(_('Updates may be delayed.')), [_]),
    haveStaleData,
  );

  const onPressUser = useCallback(
    (user: UserOrBot) => {
      navigation.push('account-details', { userId: user.user_id });
    },
    [navigation],
  );

  // The web app tries Intl.Collator too, with a fallback for browsers that
  // don't support it. See `strcmp` in static/js/util.js in the web app. Our
  // platforms should support it:
  // - MDN shows that our simple usage here is supported since iOS 10:
  //     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
  //   And we desupported iOS 10 a long time ago.
  // - On Android, I don't get an error that suggests an API is missing.
  // And it looks like Hermes, which we hope to switch to soon, supports it:
  //   https://github.com/facebook/hermes/issues/23#issuecomment-1156832485
  const userSorter = useCallback(
    (a, b) => Intl.Collator(language).compare(a.full_name, b.full_name),
    [language],
  );

  const displayUserIds = useSelector(state => {
    const userIds: $ReadOnlyArray<UserId> = latestSuccessResult?.data ?? [];
    const result = [];

    userIds.forEach(userId => {
      const user = tryGetUserForId(state, userId);
      if (!user) {
        // E.g., data out of sync because we're working outside the event
        // system. Shrug, drop this one.
        return;
      }
      result.push(user);
    });
    result.sort(userSorter);

    return result.map(user => user.user_id);
  });

  const renderItem = useCallback(
    ({ item }) => <UserItem key={item} userId={item} onPress={onPressUser} />,
    [onPressUser],
  );

  const localizableSummaryText = useMemo(
    () =>
      displayUserIds.length > 0
        ? {
            // This is actually the same string as in the web app; see where
            // that's set in static/js/read_receipts.js
            text: `\
{num_of_people, plural,
  one {This message has been <z-link>read</z-link> by {num_of_people} person:}
  other {This message has been <z-link>read</z-link> by {num_of_people} people:}\
}`,
            values: {
              num_of_people: displayUserIds.length,
              'z-link': chunks => (
                <WebLink url={new URL('/help/read-receipts', auth.realm)}>
                  {chunks.map(chunk => (
                    <ZulipText>{chunk}</ZulipText>
                  ))}
                </WebLink>
              ),
            },
          }
        : 'No one has read this message yet.',
    [auth.realm, displayUserIds.length],
  );

  const styles = useMemo(
    () =>
      createStyleSheet({
        summaryTextWrapper: { padding: 16 },
        flex1: { flex: 1 },
      }),
    [],
  );

  return (
    <Screen title="Read receipts" scrollEnabled={false}>
      {latestSuccessResult ? (
        <View style={styles.flex1}>
          <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.summaryTextWrapper}>
            <ZulipTextIntl text={localizableSummaryText} />
          </SafeAreaView>
          <FlatList style={styles.flex1} data={displayUserIds} renderItem={renderItem} />
        </View>
      ) : (
        <LoadingIndicator size={48} />
      )}
    </Screen>
  );
}
