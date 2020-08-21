/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ScrollView, Keyboard } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import { ZulipVersion } from '../utils/zulipVersion';
import type { ApiResponseServerSettings, Dispatch } from '../types';
import { connect } from '../react-redux';
import { ErrorMsg, Label, SmartUrlInput, Screen, ZulipButton } from '../common';
import { isValidUrl, tryParseUrl } from '../utils/url';
import * as api from '../api';
import { realmAdd, navigateToAuth } from '../actions';

type SelectorProps = {|
  +initialRealm: string,
|};

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{
    params: ?{|
      realm: URL | void,
      initial?: boolean,
    |},
  }>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = {|
  realmInputValue: string,
  error: string | null,
  progress: boolean,
|};

class RealmScreen extends PureComponent<Props, State> {
  state = {
    progress: false,
    realmInputValue: this.props.initialRealm,
    error: null,
  };

  scrollView: ScrollView;

  tryRealm = async () => {
    const { realmInputValue } = this.state;

    const parsedRealm = tryParseUrl(realmInputValue);
    if (!parsedRealm) {
      this.setState({ error: 'Please enter a valid URL' });
      return;
    }
    if (parsedRealm.username !== '') {
      this.setState({ error: 'Please enter the server URL, not your email' });
      return;
    }

    const { dispatch } = this.props;
    this.setState({
      progress: true,
      error: null,
    });
    try {
      const serverSettings: ApiResponseServerSettings = await api.getServerSettings(parsedRealm);
      dispatch(
        realmAdd(
          parsedRealm,
          serverSettings.zulip_feature_level ?? 0,
          new ZulipVersion(serverSettings.zulip_version),
        ),
      );
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

  handleRealmChange = (value: string) => this.setState({ realmInputValue: value });

  componentDidMount() {
    const { initialRealm } = this.props;
    if (initialRealm && initialRealm.length > 0) {
      this.tryRealm();
    }
  }

  render() {
    const { initialRealm, navigation } = this.props;
    const { progress, error, realmInputValue } = this.state;

    const styles = {
      input: { marginTop: 16, marginBottom: 8 },
      hintText: { paddingLeft: 2, fontSize: 12 },
      button: { marginTop: 8 },
    };

    return (
      <Screen
        title="Welcome"
        canGoBack={!this.props.navigation.state.params?.initial}
        padding
        centerContent
        keyboardShouldPersistTaps="always"
        shouldShowLoadingBanner={false}
      >
        <Label text="Enter your Zulip server URL:" />
        <SmartUrlInput
          style={styles.input}
          navigation={navigation}
          defaultProtocol="https://"
          defaultOrganization="your-org"
          defaultDomain="zulipchat.com"
          defaultValue={initialRealm}
          onChangeText={this.handleRealmChange}
          onSubmitEditing={this.tryRealm}
          enablesReturnKeyAutomatically
        />
        {error !== null ? (
          <ErrorMsg error={error} />
        ) : (
          <Label text="e.g. zulip.example.com" style={styles.hintText} />
        )}
        <ZulipButton
          style={styles.button}
          text="Enter"
          progress={progress}
          onPress={this.tryRealm}
          disabled={!isValidUrl(realmInputValue)}
        />
      </Screen>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  initialRealm: props.navigation.state.params?.realm?.toString() ?? '',
}))(RealmScreen);
