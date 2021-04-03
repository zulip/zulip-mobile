/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import { RawLabel, Touchable, Label } from '../common';
import { IconDone, IconTrash } from '../common/Icons';
import type { AccountStatus } from './accountsSelectors';

const styles = createStyleSheet({
  wrapper: {
    justifyContent: 'space-between',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    height: 72,
  },
  selectedAccountItem: {
    borderColor: BRAND_COLOR,
    borderWidth: 1,
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
  text: {
    fontWeight: 'bold',
    marginVertical: 2,
  },
  icon: {
    padding: 12,
    margin: 12,
  },
  signOutText: {
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'right',
    position: 'absolute',
    end: 10,
    top: 3,
    color: 'gray',
  },
});

type Props = $ReadOnly<{|
  index: number,
  account: AccountStatus,
  onSelect: (index: number) => void,
  onRemove: (index: number) => void,
|}>;

export default function AccountItem(props: Props) {
  const { email, realm, isLoggedIn } = props.account;

  const showDoneIcon = props.index === 0 && isLoggedIn;
  const backgroundItemColor = isLoggedIn ? 'hsla(177, 70%, 47%, 0.1)' : 'hsla(0,0%,50%,0.1)';
  const textColor = isLoggedIn ? BRAND_COLOR : 'gray';

  return (
    <Touchable style={styles.wrapper} onPress={() => props.onSelect(props.index)}>
      <View
        style={[
          styles.accountItem,
          showDoneIcon && styles.selectedAccountItem,
          { backgroundColor: backgroundItemColor },
        ]}
      >
        {!isLoggedIn && <Label style={styles.signOutText} text="Signed out" />}
        <View style={styles.details}>
          <RawLabel style={[styles.text, { color: textColor }]} text={email} numberOfLines={1} />
          <RawLabel
            style={[styles.text, { color: textColor }]}
            text={realm.toString()}
            numberOfLines={1}
          />
        </View>
        {!showDoneIcon ? (
          <IconTrash
            style={styles.icon}
            size={24}
            color="crimson"
            onPress={() => props.onRemove(props.index)}
          />
        ) : (
          <IconDone style={styles.icon} size={24} color={BRAND_COLOR} />
        )}
      </View>
    </Touchable>
  );
}
