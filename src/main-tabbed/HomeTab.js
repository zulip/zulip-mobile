import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Button } from '../common';
import SidebarRow from '../nav/SidebarRow';
import { homeNarrow, specialNarrow } from '../utils/narrow';

class HomeTab extends React.Component {

  handleNarrow = (narrow) => {
    const { doNarrow, pushRoute } = this.props;
    doNarrow(narrow);
    pushRoute('chat');
  };

  handleSearch = (narrow) => {
    const { pushRoute } = this.props;
    pushRoute('search');
  };

  render() {
    return (
      <View tabLabel="Home">
        <SidebarRow
          name="All Messages"
          icon="md-home"
          onPress={() => this.handleNarrow(homeNarrow())}
        />
        <SidebarRow
          name="Private Messages"
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
        <Button
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
