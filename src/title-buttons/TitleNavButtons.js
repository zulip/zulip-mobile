/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow } from '../types';
import { ViewPlaceholder } from '../common';
import { getInfoButtonFromNarrow, getExtraButtonFromNarrow } from './titleButtonFromNarrow';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
});

type Props = {|
  color: string,
  narrow: Narrow,
|};

export default class TitleNavButtons extends PureComponent<Props> {
  render() {
    const { color, narrow } = this.props;
    const InfoButton = getInfoButtonFromNarrow(narrow);
    const ExtraButton = getExtraButtonFromNarrow(narrow);

    return (
      <View style={styles.wrapper}>
        {ExtraButton ? (
          <ExtraButton color={color} narrow={narrow} />
        ) : (
          <ViewPlaceholder width={44} />
        )}
        {InfoButton ? <InfoButton color={color} narrow={narrow} /> : <ViewPlaceholder width={44} />}
      </View>
    );
  }
}
