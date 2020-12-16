/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import type { Dispatch, Auth, ThemeName, UserOrBot } from '../types';
import SpinningProgress from '../common/SpinningProgress';
import type { MessageSnapshot } from '../api/modelTypes';
import { connect } from '../react-redux';
import { getAuth, getSettings, getAllUsersById } from '../selectors';
import { Screen, ZulipWebView } from '../common';
import { showToast } from '../utils/info';
import * as api from '../api';
import editHistoryHtml from '../webview/html/editHistoryHtml';

type SelectorProps = {|
  auth: Auth,
  usersById: Map<number, UserOrBot>,
  themeName: ThemeName,
|};

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{ params: {| messageId: number |} }>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = $ReadOnly<{|
  messageHistory: MessageSnapshot[] | null,
|}>;

class EditHistory extends React.Component<Props, State> {
  state = {
    messageHistory: null,
  };

  componentDidMount() {
    const { auth, navigation } = this.props;

    api
      .getMessageHistory(auth, navigation.state.params.messageId)
      .then(response => {
        this.setState({
          messageHistory: response.message_history,
        });
      })
      .catch(err => {
        navigation.goBack();
        showToast('An error occurred while loading edit history');
      });
  }

  render() {
    const { messageHistory } = this.state;

    if (messageHistory === null) {
      return (
        <Screen title="Edit History">
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <SpinningProgress color="white" size={48} />
          </View>
        </Screen>
      );
    }
    const { usersById, auth, themeName } = this.props;

    return (
      <Screen title="Edit History">
        <ZulipWebView
          html={editHistoryHtml(messageHistory, themeName, usersById, auth)}
          onError={(msg: mixed) => {
            // eslint-disable-next-line no-console
            console.error(msg);
          }}
        />
      </Screen>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  auth: getAuth(state),
  usersById: getAllUsersById(state),
  themeName: getSettings(state).theme,
}))(EditHistory);
