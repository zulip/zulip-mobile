/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { UserId } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector, useDispatch } from '../react-redux';
import { Screen, ZulipButton, Label } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { pm1to1NarrowFromUser } from '../utils/narrow';
import AccountDetails from './AccountDetails';
import { doNarrow } from '../actions';
import { getUserIsActive, getUserForId } from '../users/userSelectors';

const styles = createStyleSheet({
  pmButton: {
    marginHorizontal: 16,
  },
  deactivatedText: {
    textAlign: 'center',
    paddingBottom: 20,
    fontStyle: 'italic',
    fontSize: 18,
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
      {!isActive && (
        <Label style={styles.deactivatedText} text="(This user has been deactivated)" />
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
