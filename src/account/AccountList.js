/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ActivityIndicator, View, FlatList, StyleSheet } from 'react-native';

import type { Auth, Account } from '../types';
import AccountItem from './AccountItem';
import { IconDone, IconTrash } from '../common/Icons';
import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  icon: {
    padding: 12,
    margin: 12,
  },
});

type Props = {|
  auth: Auth,
  accounts: Account[],
  progress: number,
  onAccountSelect: number => void,
  onAccountRemove: number => void,
|};

export default class AccountList extends PureComponent<Props> {
  getIconContent = (index: number, showDoneIcon: boolean, showProgress: boolean) => {
    if (showProgress) {
      return <ActivityIndicator style={styles.icon} color={BRAND_COLOR} />;
    }

    if (showDoneIcon) {
      return <IconDone style={styles.icon} size={24} color={BRAND_COLOR} />;
    }
    return (
      <IconTrash
        style={styles.icon}
        size={24}
        color="crimson"
        onPress={() => this.props.onAccountRemove(index)}
      />
    );
  };

  render() {
    const { accounts, onAccountSelect, auth, progress } = this.props;

    return (
      <View>
        <FlatList
          data={accounts}
          exraData={progress}
          keyExtractor={item => `${item.email}${item.realm}`}
          renderItem={({ item, index }) => {
            const showDoneIcon = index === 0 && auth.apiKey !== '' && auth.apiKey === item.apiKey;
            return (
              <AccountItem
                index={index}
                iconContent={this.getIconContent(index, showDoneIcon, progress === index)}
                showingDoneIcon={showDoneIcon}
                email={item.email}
                realm={item.realm}
                onSelect={onAccountSelect}
              />
            );
          }}
        />
      </View>
    );
  }
}
