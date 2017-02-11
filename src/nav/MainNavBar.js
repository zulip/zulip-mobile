import React from 'react';
import { connect } from 'react-redux';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';

import { styles } from '../common';
import { BRAND_COLOR } from '../common/styles';
import { isStreamNarrow } from '../utils/narrow';
import Title from '../title/Title';
import NavButton from './NavButton';

import { foregroundColorFromBackground } from '../utils/color';

const moreStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

class MainNavBar extends React.Component {

  openOverFlowMenu = (recipients) => {
    this.setState({
      recipientsList: recipients,
    });
    this.overFlowMenu.openMenu(this.mainMenu.getName());
  }

  render() {
    const { narrow, subscriptions, onPressStreams, onPressPeople, pushRoute } = this.props;

    const backgroundColor = isStreamNarrow(narrow) ?
      (subscriptions.find((sub) => narrow[0].operand === sub.name)).color :
      'white';

    const textColor = isStreamNarrow(narrow) ?
      foregroundColorFromBackground(backgroundColor) :
      BRAND_COLOR;

    return (
      <View style={moreStyles.wrapper}>
        <MenuContext
          style={styles.screen}
          ref={(overFlowMenu) => { this.overFlowMenu = overFlowMenu; }}
        >
          <StatusBar
            barStyle={textColor === 'white' ? 'light-content' : 'dark-content'}
          />
          <Menu
            ref={(mainMenu) => { this.mainMenu = mainMenu; }}
            onSelect={(value) => (value === 1) && pushRoute('group-list', this.state.recipientsList)}
          >

            <View style={[styles.navBar, { backgroundColor }]}>
              <NavButton name="ios-menu" color={textColor} onPress={onPressStreams} />
              <Title
                color={textColor}
                openOverFlowMenu={this.openOverFlowMenu}
              />
              <NavButton name="md-people" color={textColor} onPress={onPressPeople} />
            </View>
            <MenuTrigger />
            <MenuOptions>
              <MenuOption value={1}>
                <Text>Participants</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>

          {this.props.children}
        </MenuContext>
      </View>
    );
  }
}

export default connect(
  (state) => ({
    narrow: state.chat.narrow,
    subscriptions: state.subscriptions,
  })
)(MainNavBar);
