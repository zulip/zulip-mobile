/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ScrollView, Keyboard } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import type { ApiResponseServerSettings, Dispatch } from '../types';
import { connect } from '../react-redux';
import { ErrorMsg, Label, SmartUrlInput, Screen, ZulipButton } from '../common';
import { isValidUrl } from '../utils/url';
import * as api from '../api';
import { realmAdd, navigateToAuth } from '../actions';
import styles from '../styles';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  navigation: NavigationScreenProp<{
    params: ?{|
      realm: string | void,
      initial?: boolean,
    |},
  }>,
  initialRealm: string,
|}>;

type State = {|
  realm: string,
  error: string | null,
  progress: boolean,
|};

class RealmScreen extends PureComponent<Props, State> {
  state = {
    progress: false,
    realm: this.props.initialRealm,
    error: null,
  };

  scrollView: ScrollView;

  tryRealm = async () => {
    const { realm } = this.state;

    this.setState({
      realm,
      progress: true,
      error: null,
    });

    const { dispatch } = this.props;

    try {
      const serverSettings: ApiResponseServerSettings = await api.getServerSettings(realm);
      dispatch(realmAdd(realm));
      dispatch(navigateToAuth(serverSettings));
      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: 'Cannot connect to server' });
      /* eslint-disable no-console */
      console.warn('RealmScreen: failed to connect to server:', err);
      console.warn(err.stack);
    } finally {
      this.setState({ progress: false });
    }
  };

  handleRealmChange = (value: string) => this.setState({ realm: value });

  componentDidMount() {
    const { initialRealm } = this.props;
    if (initialRealm && initialRealm.length > 0) {
      this.tryRealm();
    }
  }

  render() {
    const { initialRealm, navigation } = this.props;
    const { progress, error, realm } = this.state;

    return (
      <Screen
        title="Welcome"
        canGoBack={!this.props.navigation.state.params?.initial}
        padding
        centerContent
        keyboardShouldPersistTaps="always"
      >
        <Label text="Enter your Zulip server URL:" />
        <SmartUrlInput
          style={styles.marginVertical}
          navigation={navigation}
          defaultProtocol="https://"
          defaultOrganization="your-org"
          defaultDomain="zulipchat.com"
          defaultValue={initialRealm}
          onChangeText={this.handleRealmChange}
          onSubmitEditing={this.tryRealm}
          enablesReturnKeyAutomatically
        />
        {error !== null && <ErrorMsg error={error} />}
        <ZulipButton
          style={styles.halfMarginTop}
          text="Enter"
          progress={progress}
          onPress={this.tryRealm}
          disabled={!isValidUrl(realm)}
        />
      </Screen>
    );
  }
}

export default connect((state, props) => ({
  initialRealm: props.navigation.state.params?.realm ?? '',
}))(RealmScreen);
