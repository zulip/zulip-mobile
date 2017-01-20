import React, { Component } from 'react';
import { StyleSheet, ListView } from 'react-native';

import { getFullUrl } from '../utils/url';
import { normalizeRecipients } from '../utils/message';
import { isPrivateNarrow, isGroupNarrow } from '../utils/narrow';
import UserItem from '../users/UserItem';
import UserGroup from './UserGroup';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  groupHeader: {
    fontWeight: 'bold',
    paddingLeft: 8,
    fontSize: 18,
  }
});

export default class ConversationList extends Component {

  props: {
    conversations: string[],
    realm: string,
    users: any[],
    onNarrow: (email: string) => void,
  }

  renderUserItem = ({ email, users, realm, narrow, onNarrow }) => {
    const user = users.find(x => x.email === email);

    if (!user) return null;

    return (
      <UserItem
        key={email}
        fullName={user.fullName}
        avatarUrl={getFullUrl(user.avatarUrl, realm)}
        email={email}
        status={user.status}
        isSelected={isPrivateNarrow(narrow) && narrow[0].operand === email}
        onPress={onNarrow}
      />
    );
  };

  renderUserGroup = ({ email, users, narrow, onNarrow }) => {
    const emails = email.split(',');
    const allNames = emails.map(e =>
      (users.find(x => x.email === e) || {}).fullName
    ).join(', ');

    return (
      <UserGroup
        key={email}
        email={email}
        allNames={allNames}
        isSelected={isGroupNarrow(narrow) && email === normalizeRecipients(narrow[0].operand)}
        onPress={onNarrow}
      />
    );
  };

  render() {
    const { conversations, users, realm, narrow, onNarrow } = this.props;

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(conversations);

    return (
      <ListView
        enableEmptySections
        style={styles.container}
        dataSource={dataSource}
        pageSize={12}
        renderRow={(email => {
          const renderFunc = (email.indexOf(',') === -1) ?
            this.renderUserItem :
            this.renderUserGroup;

          return renderFunc({ email, users, realm, narrow, onNarrow });
        })}
      />
    );
  }
}
