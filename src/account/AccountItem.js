/* @flow strict-local */
import React, { useEffect, useState, useContext } from 'react';
import type { Node } from 'react';
import { View, Image } from 'react-native';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import { RawLabel, Touchable, Label, LoadingIndicator } from '../common';
import { IconDone, IconTrash } from '../common/Icons';
import type { AccountStatus } from './accountsSelectors';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import * as api from '../api';
import { TranslationContext } from '../boot/TranslationProvider';
import { showErrorAlert } from '../utils/info';

const styles = createStyleSheet({
  wrapper: {
    justifyContent: 'space-between',
  },
  accountItem: {
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
  },
  icon: {
    padding: 12,
    margin: 12,
  },
  signedOutText: {
    fontStyle: 'italic',
    color: 'gray',
    fontWeight: 'bold',
  },
  organisationIcon: {
    padding: 12,
    margin: 12,
    width: 50,
    height: 50,
  },
});

type Props = $ReadOnly<{|
  index: number,
  account: AccountStatus,
  onSelect: (index: number) => Promise<void> | void,
  onRemove: (index: number) => Promise<void> | void,
|}>;

export default function AccountItem(props: Props): Node {
  const { email, realm, isLoggedIn } = props.account;
  const _ = useContext(TranslationContext);
  // Don't show the "remove account" button (the "trash" icon) for the
  // active account when it's logged in.  This prevents removing it when the
  // main app UI, relying on that account's data, may be on the nav stack.
  // See `getHaveServerData`.
  const showDoneIcon = props.index === 0 && isLoggedIn;

  const backgroundItemColor = isLoggedIn ? 'hsla(177, 70%, 47%, 0.1)' : 'hsla(0,0%,50%,0.1)';
  const textColor = isLoggedIn ? BRAND_COLOR : 'gray';
  const accountItemHeight = isLoggedIn ? 88 : 94;

  const [orgDetail, setOrgDetail] = useState({
    realm_icon: '',
    realm_name: '',
    realm_uri: '',
  });

  const getServerData = async () => {
    try {
      const serverSettings: ApiResponseServerSettings = await api.getServerSettings(realm);
      setOrgDetail(serverSettings);
    } catch (e) {
      showErrorAlert(_('Failed to connect to server: {realm}', { realm: realm.toString() }));
    }
  };

  useEffect(() => {
    getServerData();
  }, []);

  if (!orgDetail.realm_icon || !orgDetail.realm_name || !orgDetail.realm_uri) {
    return <LoadingIndicator size={40} />;
  }

  return (
    <Touchable style={styles.wrapper} onPress={() => props.onSelect(props.index)}>
      <View
        style={[
          styles.accountItem,
          showDoneIcon && styles.selectedAccountItem,
          { backgroundColor: backgroundItemColor, height: accountItemHeight },
        ]}
      >
        <Image
          style={styles.organisationIcon}
          source={{ uri: orgDetail.realm_uri + orgDetail.realm_icon }}
        />
        <View style={styles.details}>
          <RawLabel
            style={[styles.text, { color: textColor, fontSize: 20 }]}
            text={orgDetail.realm_name}
            numberOfLines={1}
          />
          <RawLabel
            style={[styles.text, { color: 'gray', fontSize: 13 }]}
            text={orgDetail.realm_uri}
            numberOfLines={1}
          />
          <RawLabel style={[styles.text, { color: textColor }]} text={email} numberOfLines={1} />
          {!isLoggedIn && (
            <Label style={styles.signedOutText} text="Signed out" numberOfLines={1} />
          )}
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
