/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { UserId } from '../types';
import globalStyles, { createStyleSheet } from '../styles';
import { useSelector, useDispatch } from '../react-redux';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { IconPrivateChat } from '../common/Icons';
import { pm1to1NarrowFromUser } from '../utils/narrow';
import AccountDetails from './AccountDetails';
import ZulipText from '../common/ZulipText';
import ActivityText from '../title/ActivityText';
import { doNarrow } from '../actions';
import { getUserIsActive, getUserForId } from '../users/userSelectors';
import { nowInTimeZone } from '../utils/date';
import CustomProfileFields from './CustomProfileFields';

const styles = createStyleSheet({
  pmButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  deactivatedText: {
    textAlign: 'center',
    paddingBottom: 20,
    fontStyle: 'italic',
    fontSize: 18,
  },
  itemWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account-details'>,
  route: RouteProp<'account-details', {| userId: UserId |}>,
|}>;

export default function AccountDetailsScreen(props: Props): Node {
  const dispatch = useDispatch();
  const user = useSelector(state => getUserForId(state, props.route.params.userId));
  const isActive = useSelector(state => getUserIsActive(state, props.route.params.userId));

  const handleChatPress = useCallback(() => {
    dispatch(doNarrow(pm1to1NarrowFromUser(user)));
  }, [user, dispatch]);

  let localTime: string | null = null;
  // See comments at CrossRealmBot and User at src/api/modelTypes.js.
  if (user.timezone !== '' && user.timezone !== undefined) {
    try {
      localTime = `${nowInTimeZone(user.timezone)} Local time`;
    } catch {
      // The set of timezone names in the tz database is subject to change over
      // time. Handle unrecognized timezones by quietly discarding them.
    }
  }

  const title = {
    text: '{_}',
    values: {
      // This causes the name not to get translated.
      _: user.full_name || ' ',
    },
  };

  return (
    <Screen title={title}>
      <AccountDetails user={user} />
      <View style={styles.itemWrapper}>
        <ActivityText style={globalStyles.largerText} user={user} />
      </View>
      {localTime !== null && (
        <View style={styles.itemWrapper}>
          <ZulipText style={globalStyles.largerText} text={localTime} />
        </View>
      )}
      <View style={styles.itemWrapper}>
        <CustomProfileFields user={user} />
      </View>
      {!isActive && (
        <ZulipTextIntl style={styles.deactivatedText} text="(This user has been deactivated)" />
      )}
      <ZulipButton
        style={styles.pmButton}
        text={isActive ? 'Send private message' : 'View private messages'}
        onPress={handleChatPress}
        Icon={IconPrivateChat}
      />
    </Screen>
  );
}
