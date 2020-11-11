/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ScrollView, Keyboard } from 'react-native';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import NavigationService from '../nav/NavigationService';
import { ZulipVersion } from '../utils/zulipVersion';
import type { Dispatch } from '../types';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import { connect } from '../react-redux';
import { ErrorMsg, Label, SmartUrlInput, Screen, ZulipButton } from '../common';
import { tryParseUrl } from '../utils/url';
import * as api from '../api';
import { realmAdd, navigateToAuth } from '../actions';

type SelectorProps = {|
  +initialRealmInputValue: string,
|};

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<{|
    ...NavigationStateRoute,
    params?: {|
      realm: URL | void,
      initial?: boolean,
    |},
  |}>,

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
    realmInputValue: this.props.initialRealmInputValue,
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
      NavigationService.dispatch(navigateToAuth(serverSettings));
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
    const { initialRealmInputValue } = this.props;
    if (initialRealmInputValue && initialRealmInputValue.length > 0) {
      this.tryRealm();
    }
  }

  render() {
    const { initialRealmInputValue, navigation } = this.props;
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
          defaultValue={initialRealmInputValue}
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
          disabled={tryParseUrl(realmInputValue) === undefined}
        />
      </Screen>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  initialRealmInputValue: props.navigation.state.params?.realm?.toString() ?? '',
}))(RealmScreen);
