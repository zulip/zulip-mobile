/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, Style } from '../types';
import Label from './Label';
import ZulipSwitch from './ZulipSwitch';

type Props = {|
  Icon?: Object,
  label: string,
  defaultValue: boolean,
  style?: Style,
  onValueChange: (newValue: boolean) => void,
|};

export default class OptionRow extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { label, defaultValue, onValueChange, style, Icon } = this.props;
    const { styles: contextStyles } = this.context;

    return (
      <View style={[contextStyles.listItem, style]}>
        {Icon && <Icon size={18} style={[contextStyles.icon, contextStyles.settingsIcon]} />}
        <Label text={label} style={contextStyles.flexed} />
        <View style={contextStyles.rightItem}>
          <ZulipSwitch defaultValue={defaultValue} onValueChange={onValueChange} />
        </View>
      </View>
    );
  }
}
