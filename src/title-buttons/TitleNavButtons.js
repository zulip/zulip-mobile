/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow } from '../types';
import { ViewPlaceholder } from '../common';
import { getTitleTextColor } from '../selectors';
import { getInfoButtonFromNarrow, getExtraButtonFromNarrow } from './titleButtonFromNarrow';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
});

type Props = {
  color: string,
  narrow: Narrow,
};

class TitleNavButtons extends PureComponent<Props> {
  props: Props;

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

export default connect((state, props) => ({
  color: getTitleTextColor(props.narrow)(state),
}))(TitleNavButtons);
