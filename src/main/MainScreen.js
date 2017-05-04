import React from 'react';
import { StyleSheet, View } from 'react-native';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import { StreamDrawer, UsersDrawer } from './Drawers';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class MainScreen extends React.Component {

  static navigationOptions = {
    title: 'Welcome',
  };

  constructor(props) {
    super(props);
    this.state = {
      leftDrawerOpen: false,
      rightDrawerOpen: false,
    };
  }

  handlePressPeople = () => {
    UsersDrawer.navigate('DrawerOpen');
  }

  handlePressStreams = () => {
    StreamDrawer.navigate('DrawerOpen');
  }

  render() {
    const {
      doNarrow,
      navigateToAllStreams,
      navigateToUsers,
      navigateToSearch,
    } = this.props;

    return (
      <View style={styles.wrapper}>
        <MainNavBar
          onPressPeople={this.handlePressPeople}
          onPressStreams={this.handlePressStreams}
        />
        <Chat {...this.props} />
      </View>

      //
      // <SideDrawer
      //   side="left"
      //   open={leftDrawerOpen}
      //   orientation={orientation}
      //   onOpenStart={() => this.setState({ leftDrawerOpen: true })}
      //   onClose={() => this.setState({ leftDrawerOpen: false })}
      //   content={
      //     <StreamSidebar
      //       navigateToAllStreams={navigateToAllStreams}
      //       navigateToSearch={navigateToSearch}
      //       onNarrow={newNarrow => {
      //         doNarrow(newNarrow);
      //         this.setState({ leftDrawerOpen: false });
      //       }}
      //     />
      //   }
      // >
      //   <SideDrawer
      //     side="right"
      //     open={rightDrawerOpen}
      //     orientation={orientation}
      //     onOpenStart={() => this.setState({ rightDrawerOpen: true })}
      //     onClose={() => this.setState({ rightDrawerOpen: false })}
      //     content={
      //       <ConversationsContainer
      //         navigateToUsers={navigateToUsers}
      //         onNarrow={newNarrow => {
      //           doNarrow(newNarrow);
      //           this.setState({ rightDrawerOpen: false });
      //         }}
      //       />
      //     }
      //   >
      //     <MainNavBar
      //       noStatusBar={leftDrawerOpen || rightDrawerOpen}
      //       onPressPeople={() => this.setState({ rightDrawerOpen: true })}
      //       onPressStreams={() => this.setState({ leftDrawerOpen: true })}
      //     >
      //       <Chat {...this.props} />
      //     </MainNavBar>
      //   </SideDrawer>
      // </SideDrawer>
    );
  }
}
