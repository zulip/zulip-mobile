import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { ZulipButton } from '../common';
import SidebarRow from '../nav/SidebarRow';
import { homeNarrow, specialNarrow } from '../utils/narrow';

class HomeTab extends React.Component {

  static navigationOptions = {
    title: 'Home Tab',
  };

  handleNarrow = (narrow) => {
    const { doNarrow, navigation } = this.props;
    doNarrow(narrow);
    navigation.navigate('chat');
  };

  handleSearch = (narrow) => {
    const { navigation } = this.props;
    navigation.navigate('search');
  };

  render() {
    return (
      <View tabLabel="Home">
        <SidebarRow
          name="All messages"
          icon="md-home"
          onPress={() => this.handleNarrow(homeNarrow())}
        />
        <SidebarRow
          name="Private messages"
          icon="md-chatboxes"
          onPress={() => this.handleNarrow(specialNarrow('private'))}
        />
        <SidebarRow
          name="Starred"
          icon="md-star"
          onPress={() => this.handleNarrow(specialNarrow('starred'))}
        />
        <SidebarRow
          name="Mentions"
          icon="md-at"
          onPress={() => this.handleNarrow(specialNarrow('mentioned'))}
        />
        <ZulipButton
          secondary
          text="Search"
          onPress={this.handleSearch}
        />
      </View>
    );
  }
}

export default connect(
  null,
  boundActions,
)(HomeTab);
