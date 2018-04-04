/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, Keyboard } from 'react-native';
import isUrl from 'is-url';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { ErrorMsg, Label, SmartUrlInput, Screen, ZulipButton } from '../common';
import { getServerSettings } from '../api';

type Props = {
  actions: Actions,
  navigation: Object,
  initialRealm: string,
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
      this.setState({ error: 'Cannot connect to server' });
    } finally {
      this.setState({ progress: false });
    }
  };

  handleRealmChange = value => this.setState({ realm: value });

  render() {
    const { styles } = this.context;
    const { initialRealm, navigation } = this.props;
    const { progress, error, realm } = this.state;

    return (
      <Screen title="Welcome" padding centerContent>
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
}))(RealmScreen);
