import React from 'react';
import { FlatList, SectionList, StyleSheet } from 'react-native';

import MessageContainer from '../message/MessageContainer';
import TaggedView from '../native/TaggedView';
import { LoadingIndicator } from '../common';
import renderMessages from './renderMessages';
import { getFullUrl } from '../utils/url';

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
});

export default class MessageList extends React.PureComponent {
  autoScrollToBottom = false;

  static defaultProps = {
    onScroll: () => {},
  };

  componentWillReceiveProps(nextProps) {
    this.autoScrollToBottom = this.props.caughtUp.newer && nextProps.caughtUp.newer;
  }

  render() {
    const {
      auth,
      caughtUp,
      fetching,
      messages,
      users,
      doNarrow,
      fetchOlder,
      fetchNewer,
      singleFetchProgress,
      onScroll,
    } = this.props;
    const messageList = renderMessages(this.props);

    // `headerIndices` tell the scroll view which components are headers
    // and are eligible to be docked at the top of the view.
    const headerIndices = [];
    for (let i = 0; i < messageList.length; i++) {
      const elem = messageList[i];
      if (elem.props.type === 'header') {
        headerIndices.push(i + 1);
      }
      if (elem.props.type === 'message') {
        messageList[i] = (
          <TaggedView
            key={elem.props.message.id}
            tagID={elem.props.message.id.toString()}
            collapsable={false}
          >
            {elem}
          </TaggedView>
        );
      }
    }

    return (
      <FlatList
        style={styles.list}
        enableEmptySections
        sections={[]}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          <MessageContainer
            auth={auth}
            message={item}
            isBrief={false}
            doNarrow={doNarrow}
            avatarUrl={getFullUrl(item.avatar_url, auth.realm)}
            users={users}
          />
        }
        renderSectionHeader={({ section }) =>
          <Text style={styles.groupHeader}>
            {section.key}
          </Text>
        }
      />
      // <InfiniteScrollView
      //   style={styles.list}
      //   automaticallyAdjustContentInset="false"
      //   stickyHeaderIndices={headerIndices}
      //   onStartReached={fetchOlder}
      //   onEndReached={fetchNewer}
      //   autoScrollToBottom={this.autoScrollToBottom}
      //   onScroll={onScroll}
      // >
      //   <LoadingIndicator active={fetching.older} caughtUp={caughtUp.older} />
      //   {messageList}
      //   {!singleFetchProgress && fetching.newer && <LoadingIndicator active />}
      // </InfiniteScrollView>
    );
  }
}
