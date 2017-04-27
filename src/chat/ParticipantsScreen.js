import React from 'react';
import { View, Text, ListView, StyleSheet } from 'react-native';
import { Avatar, Touchable, Screen } from '../common';
import styles from '../common/styles';

const moreStyles = StyleSheet.create({
  userList: {
    marginTop: 16,
  },
});

export default class GroupList extends React.PureComponent {

  render() {
    const { recipients } = this.props;
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(recipients);

    return (
      <Screen title="Participants List">
        <View style={styles.center}>
          <ListView
            style={moreStyles.userList}
            dataSource={dataSource}
            renderRow={(rowData) =>
              <Touchable>
                <View style={styles.userItemRow}>
                  <Avatar
                    size={32}
                    avatarUrl={rowData.avatarUrl}
                    name={rowData.fullName}
                    status={rowData.status}
                  />
                  <View>
                    <Text style={styles.userItemText}>
                      {rowData.fullName}
                    </Text>
                    <Text style={styles.userItemText}>
                      {rowData.email}
                    </Text>
                  </View>
                </View>
              </Touchable>
            }
          />
        </View>
      </Screen>
    );
  }
}
