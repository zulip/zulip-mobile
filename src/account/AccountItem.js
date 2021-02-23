/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import { RawLabel, Touchable } from '../common';
import { IconDone, IconTrash } from '../common/Icons';

const styles = createStyleSheet({
  wrapper: {
    justifyContent: 'space-between',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'hsla(177, 70%, 47%, 0.1)',
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
    color: BRAND_COLOR,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  icon: {
    padding: 12,
    margin: 12,
  },
});

type Props = $ReadOnly<{|
  index: number,
  email: string,
  realm: URL,
  onSelect: (index: number) => void,
  onRemove: (index: number) => void,
  showDoneIcon: boolean,
|}>;

export default function AccountItem(props: Props) {
  const { email, realm, showDoneIcon } = props;

  return (
    <Touchable style={styles.wrapper} onPress={() => props.onSelect(props.index)}>
      <View style={[styles.accountItem, showDoneIcon && styles.selectedAccountItem]}>
        <View style={styles.details}>
          <RawLabel style={styles.text} text={email} numberOfLines={1} />
          <RawLabel style={styles.text} text={realm.toString()} numberOfLines={1} />
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
