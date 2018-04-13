/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, Keyboard, Platform } from 'react-native';
import isUrl from 'is-url';
import { getSession } from '../selectors';
import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import ConnectIgnoringSSLAndroid from '../nativeModules/ConnectIgnoringSSLAndroid';
import ConnectIgnoringSSLIOS from '../nativeModules/ConnectIgnoringSslIOS';
import { ErrorMsg, Label, SmartUrlInput, Screen, ZulipButton } from '../common';
import { getServerSettings } from '../api';

type Props = {
  actions: Actions,
  navigation: Object,
  initialRealm: string,
  isOnline: boolean,
};

type State = {
  realm: string,
  error: ?string,
  progress: boolean,
};

class RealmScreen extends PureComponent<Props, State> {
  props: Props;
  state: State;
  scrollView: ScrollView;

  static contextTypes = {
    styles: () => null,
  };

  state = {
    progress: false,
    realm: this.props.initialRealm,
    error: undefined,
  };

  tryRealm = async () => {
    const { realm } = this.state;

    this.setState({
      realm,
      progress: true,
      error: undefined,
    });

    const { actions } = this.props;

    try {
      const serverSettings = await getServerSettings(realm);
      actions.realmAdd(realm);
      actions.navigateToAuth(serverSettings);
      Keyboard.dismiss();
    } catch (err) {
      this.classifyError(realm);
    } finally {
      this.setState({ progress: false });
    }
  };

  handleRealmChange = value => this.setState({ realm: value });

  componentDidMount() {
    const { initialRealm } = this.props;
    if (initialRealm && initialRealm.length > 0) {
      this.tryRealm();
    }
  }

  classifyError = async realm => {
    let error = '';
    const { isOnline } = this.props;
    if (!isOnline) {
      error = 'Network connection is down';
    } else {
      // two cases either the server doesnt exist or SSL problem
      try {
        if (Platform.OS === 'android') await ConnectIgnoringSSLAndroid.connect(realm);
        else await ConnectIgnoringSSLIOS.connect(realm);
        error = "This server can't provide a secure connection";
      } catch (err) {
        error = 'Cannot connect to the server';
      }
    }
    this.setState({ error });
  };

  render() {
    const { styles } = this.context;
    const { initialRealm, navigation } = this.props;
    const { progress, error, realm } = this.state;

    return (
      <Screen title="Welcome" padding centerContent keyboardShouldPersistTaps="always">
        <Label text="Organization URL" />
        <SmartUrlInput
          style={styles.marginTopBottom}
          navigation={navigation}
          defaultOrganization="your-org"
          protocol="https://"
          append=".zulipchat.com"
          shortAppend=".com"
          defaultValue={initialRealm}
          onChange={this.handleRealmChange}
          onSubmitEditing={this.tryRealm}
          enablesReturnKeyAutomatically
        />
        {error && <ErrorMsg error={error} />}
        <ZulipButton
          style={styles.smallMarginTop}
          text="Enter"
          progress={progress}
          onPress={this.tryRealm}
          disabled={!isUrl(realm)}
        />
      </Screen>
    );
  }
}

export default connectWithActions((state, props) => ({
  initialRealm:
    (props.navigation && props.navigation.state.params && props.navigation.state.params.realm) ||
    '',
  isOnline: getSession(state).isOnline,
}))(RealmScreen);
