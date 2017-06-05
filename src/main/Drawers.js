import React from 'react';
import { DrawerNavigator } from 'react-navigation';
import { Button, Platform, ScrollView, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import StreamSidebar from '../nav/StreamSidebar';
import ConversationsContainer from '../conversations/ConversationsContainer';

//
// export default props => (
//   <Drawer
//     content={props.content}
//     open={props.open}
//     side={props.side}
//     tapToClose
//     openDrawerOffset={props.orientation === 'LANDSCAPE' ? 0.4 : 0.2}
//     negotiatePan
//     panOpenMask={0.1}
//     useInteractionManager
//     tweenDuration={150}
//     tweenHandler={ratio => ({
//       mainOverlay: {
//         opacity: ratio / 2,
//         backgroundColor: 'black',
//       },
//     })}
//     onOpenStart={props.onOpenStart}
//     onClose={props.onClose}
//   >
//     {props.children}
//   </Drawer>
// );
//

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
});

const MyNavScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <Button
      onPress={() => navigation.navigate('DrawerOpen')}
      title="Open drawer"
    />
    <Button
      onPress={() => navigation.goBack(null)}
      title="Go back"
    />
  </ScrollView>
);

const InboxScreen = ({ navigation }) => (
  <MyNavScreen
    navigation={navigation}
  />
);

InboxScreen.navigationOptions = {
  drawerLabel: 'Inbox',
  drawerIcon: ({ tintColor }) => (
    <MaterialIcons
      name="move-to-inbox"
      size={24}
      style={{ color: tintColor }}
    />
  ),
};

export const StreamDrawer = DrawerNavigator({
  Inbox: {
    path: '/',
    screen: InboxScreen,
  },
}, {
  contentComponent: StreamSidebar,
  initialRouteName: 'Inbox',
  contentOptions: {
    activeTintColor: '#e91e63',
  },
});

export const UsersDrawer = DrawerNavigator({
  Inbox: {
    path: '/',
    screen: InboxScreen,
  },
}, {
  contentComponent: ConversationsContainer,
  initialRouteName: 'Inbox',
  contentOptions: {
    activeTintColor: '#e91e63',
  },
});
