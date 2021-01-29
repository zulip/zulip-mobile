/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, GetText } from '../types';
import { TranslationContext } from '../boot/TranslationProvider';

import { connect } from '../react-redux';
import { getUnreadMentionsTotal } from '../selectors';
import { IconMention } from '../common/Icons';
import { CountOverlay } from '../common';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  unreadMentionsTotal: number,
  color: string,
|}>;

class IconUnreadMentions extends PureComponent<Props> {
  static contextType = TranslationContext;
  context: GetText;

  render() {
    const { unreadMentionsTotal, color } = this.props;
    const _ = this.context;
    return (
      <View>
        <CountOverlay unreadCount={unreadMentionsTotal}>
          <IconMention size={24} color={color} accessibilityLabel={_('Mentions')} />
        </CountOverlay>
      </View>
    );
  }
}

export default connect(state => ({
  unreadMentionsTotal: getUnreadMentionsTotal(state),
}))(IconUnreadMentions);
