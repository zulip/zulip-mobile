/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet, Image } from 'react-native';

import type { Context, Dispatch } from '../types';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import { doNarrow, navigateToSearch } from '../actions';
import { OptionButton, Label, OptionDivider } from '../common';
import { IconHome, IconStar, IconMention, IconSettings } from '../common/Icons';
import { navigateToSettings } from './navActions';
import { getSelfUserDetail, getCurrentRealm } from '../selectors';
import { getFullUrl } from '../utils/url';
import { getGravatarFromEmail } from '../utils/avatar';

const componentStyles = StyleSheet.create({
  rowList: {
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  userInfo: {
    padding: 16,
  },
  labels: {
    paddingTop: 8,
  },
});

type Props = {
  dispatch: Dispatch,
  realm: string,
  user: Object,
};

class Sidebar extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch, realm, user } = this.props;
    const { avatar_url, email, full_name } = user;
    const fullAvatarUrl = avatar_url ? getFullUrl(avatar_url, realm) : getGravatarFromEmail(email);
    const avatarStyle = {
      height: 50,
      width: 50,
      borderRadius: 25,
    };

    return (
      <View>
        <View style={componentStyles.userInfo}>
          <Image source={{ uri: fullAvatarUrl }} style={avatarStyle} />
          <View style={componentStyles.labels}>
            <Label text={full_name} />
            <Label text={email} />
          </View>
        </View>
        <OptionDivider />
        <View style={componentStyles.rowList}>
          <OptionButton
            Icon={IconHome}
            label="All messages"
            onPress={() => {
              dispatch(doNarrow(homeNarrow));
            }}
          />
          <OptionButton
            Icon={IconStar}
            label="Starred messages"
            onPress={() => {
              dispatch(doNarrow(specialNarrow('starred')));
            }}
          />
          <OptionButton
            Icon={IconMention}
            label="Mentions"
            onPress={() => {
              dispatch(doNarrow(specialNarrow('mentioned')));
            }}
          />
          <OptionButton
            Icon={IconSettings}
            label="Settings"
            onPress={() => {
              dispatch(navigateToSettings());
            }}
          />
        </View>
      </View>
    );
  }
}

export default connect(state => ({
  realm: getCurrentRealm(state),
  user: getSelfUserDetail(state),
}))(Sidebar);
