/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ChildrenArray } from '../types';
import { BRAND_COLOR } from '../styles';
import { RawLabel, Touchable } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(36, 202, 194, 0.1)',
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
});

type Props = {|
  index: number,
  email: string,
  iconContent: ChildrenArray<*>,
  realm: string,
  onSelect: (index: number) => void,
  showingDoneIcon: boolean,
|};

export default class AccountItem extends PureComponent<Props> {
  handleSelect = () => this.props.onSelect(this.props.index);

  render() {
    const { email, iconContent, realm, showingDoneIcon } = this.props;

    return (
      <Touchable style={styles.wrapper} onPress={this.handleSelect}>
        <View style={[styles.accountItem, showingDoneIcon && styles.selectedAccountItem]}>
          <View style={styles.details}>
            <RawLabel style={styles.text} text={email} numberOfLines={1} />
            <RawLabel style={styles.text} text={realm} numberOfLines={1} />
          </View>
          {iconContent}
        </View>
      </Touchable>
    );
  }
}
