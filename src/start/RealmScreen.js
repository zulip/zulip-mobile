/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ScrollView, Keyboard } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import type { ApiResponseServerSettings, Dispatch } from '../types';
import { connectFlowFixMe } from '../react-redux';
import { ErrorMsg, Label, SmartUrlInput, Screen, ZulipButton } from '../common';
import { isValidUrl } from '../utils/url';
import { getServerSettings } from '../api';
import { realmAdd, navigateToAuth } from '../actions';
import styles from '../styles';

type Props = {|
  dispatch: Dispatch,
  navigation: NavigationScreenProp<mixed>,
  initialRealm: string,
|};

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
      const serverSettings: ApiResponseServerSettings = await getServerSettings(realm);
      dispatch(realmAdd(realm));
      dispatch(navigateToAuth(serverSettings));
      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: 'Cannot connect to server' });
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
      <Screen title="Welcome" padding centerContent keyboardShouldPersistTaps="always">
        <Label text="Organization URL" />
        <SmartUrlInput
          style={styles.marginVertical}
          navigation={navigation}
          defaultOrganization="your-org"
          protocol="https://"
          append=".zulipchat.com"
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

export default connectFlowFixMe((state, props) => ({
  initialRealm:
    (props.navigation && props.navigation.state.params && props.navigation.state.params.realm)
    || '',
}))(RealmScreen);
