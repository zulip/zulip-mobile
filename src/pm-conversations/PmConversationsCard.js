/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationTabProp, NavigationStateRoute } from 'react-navigation-tabs';

import * as NavigationService from '../nav/NavigationService';
import type { ThemeData } from '../styles';
import { ThemeContext, createStyleSheet } from '../styles';
import type { Dispatch, PmConversationData } from '../types';
import { connect } from '../react-redux';
import { Label, ZulipButton, LoadingBanner } from '../common';
import { IconPeople, IconSearch } from '../common/Icons';
import PmConversationList from './PmConversationList';
import { getRecentConversations } from '../selectors';
import { navigateToCreateGroup, navigateToUsersScreen } from '../actions';

const styles = createStyleSheet({
  container: {
    flex: 1,
  },
  button: {
    margin: 8,
    flex: 1,
  },
  emptySlate: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
  },
});

type Props = $ReadOnly<{|
  // Since we've put this screen in a tab-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the tab-nav shape.
  navigation: NavigationTabProp<NavigationStateRoute>,

  dispatch: Dispatch,
  conversations: PmConversationData[],
|}>;

/**
 * The "PMs" page in the main tabs navigation.
 * */
class PmConversationsCard extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    const { dispatch, conversations } = this.props;

    return (
      <View style={[styles.container, { backgroundColor: this.context.backgroundColor }]}>
        <View style={styles.row}>
          <ZulipButton
            secondary
            Icon={IconPeople}
            style={styles.button}
            text="Create group"
            onPress={() => {
              setTimeout(() => NavigationService.dispatch(navigateToCreateGroup()));
            }}
          />
          <ZulipButton
            secondary
            Icon={IconSearch}
            style={styles.button}
            text="Search"
            onPress={() => {
              setTimeout(() => NavigationService.dispatch(navigateToUsersScreen()));
            }}
          />
        </View>
        <LoadingBanner />
        {conversations.length === 0 ? (
          <Label style={styles.emptySlate} text="No recent conversations" />
        ) : (
          <PmConversationList dispatch={dispatch} conversations={conversations} />
        )}
      </View>
    );
  }
}

export default connect(state => ({
  conversations: getRecentConversations(state),
}))(PmConversationsCard);
