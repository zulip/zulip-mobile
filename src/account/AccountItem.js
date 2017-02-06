import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { BRAND_COLOR } from '../common/styles';
import { ZulipButton, Touchable } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(36, 202, 194, 0.1)',
    borderRadius: 5,
    padding: 8,
    height: 52,
  },
  selectedAccountItem: {
    borderColor: BRAND_COLOR,
    borderWidth: 1,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
    height: 36,
  },
  text: {
    color: BRAND_COLOR,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 36,
    height: 36,
  },
  icon: {
    padding: 6,
  }
});

export default class AccountItem extends React.PureComponent {

  props: {
    index: number,
    email: string,
    realm: string,
    canRemove: boolean,
    onSelect: () => void,
    onRemove: () => void,
  };

  handleSelect = () =>
    this.props.onSelect(this.props.index);

  handleRemove = () =>
    this.props.onRemove(this.props.index);

  render() {
    const { email, realm, index, canRemove } = this.props;
    const isSelected = index === 0;

    return (
      <Touchable style={styles.wrapper} onPress={this.handleSelect}>
        <View style={[styles.accountItem, isSelected && styles.selectedAccountItem]}>
          <View style={styles.details}>
            <Text style={[styles.text, styles.selectedText]}>{email}</Text>
            <Text style={[styles.text, styles.selectedText]}>{realm}</Text>
          </View>
          {canRemove ?
            <ZulipButton
              text="X"
              customStyles={styles.removeButton}
              onPress={this.handleRemove}
            /> :
            <Icon
              style={styles.icon}
              size={24}
              color={BRAND_COLOR}
              name="done"
            />
          }
        </View>
      </Touchable>
    );
  }
}
