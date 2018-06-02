/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { EditMessage, Narrow } from '../types';
import { ViewPlaceholder } from '../common';
import { getSession } from '../selectors';
import { getInfoButtonFromNarrow, getExtraButtonFromNarrow } from './titleButtonFromNarrow';
import AnimatedSlideComponent from '../animation/AnimatedSlideComponent';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
});

type Props = {|
  color: string,
  editMessage: ?EditMessage,
  narrow: Narrow,
|};

class TitleNavButtons extends PureComponent<Props> {
  render() {
    const { color, editMessage, narrow } = this.props;
    const InfoButton = getInfoButtonFromNarrow(narrow);
    const ExtraButton = getExtraButtonFromNarrow(narrow);

    return (
      <AnimatedSlideComponent visible={!editMessage} property="translateX">
        <View style={styles.wrapper}>
          {ExtraButton ? (
            <ExtraButton color={color} narrow={narrow} />
          ) : (
            <ViewPlaceholder width={44} />
          )}
          {InfoButton ? (
            <InfoButton color={color} narrow={narrow} />
          ) : (
            <ViewPlaceholder width={44} />
          )}
        </View>
      </AnimatedSlideComponent>
    );
  }
}

export default connect((state, props) => ({
  editMessage: getSession(state).editMessage,
}))(TitleNavButtons);
