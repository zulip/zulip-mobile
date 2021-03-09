/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Keyboard } from 'react-native';
import { Picker as CololPicker } from '@react-native-picker/picker';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { ZulipVersion } from '../utils/zulipVersion';
import type { Dispatch } from '../types';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import { connect } from '../react-redux';
import { ErrorMsg, Label, SmartUrlInput, Screen, ZulipButton } from '../common';
import { tryParseUrl } from '../utils/url';
import * as api from '../api';
import { realmAdd, navigateToAuth } from '../actions';
import { ReadableColors } from '../utils/ReadableColors'


type SelectorProps = {|
  +initialRealmInputValue: string,
|};

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'realm-input'>,
  route: RouteProp<'realm-input', {| realm: URL | void, initial: boolean | void |}>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = {|
  realmInputValue: string,
  error: string | null,
  progress: boolean,
|};

class RealmInputScreen extends PureComponent<Props, State> {
  state = {
    progress: false,
    realmInputValue: this.props.initialRealmInputValue,
    error: null,
    colors: null,
    selectedColor: this.props.serverColor,
  };

  tryRealm = async () => {
    const { realmInputValue, selectedColor } = this.state;
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
      await dispatch(
        realmAdd(
          parsedRealm,
          selectedColor,
          serverSettings.zulip_feature_level ?? 0,
          new ZulipVersion(serverSettings.zulip_version),
        ),
      );
      NavigationService.dispatch(navigateToAuth(serverSettings));
      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: 'Cannot connect to server' });
      /* eslint-disable no-console */
      console.warn('RealmInputScreen: failed to connect to server:', err);
      console.warn(err.stack);
    } finally {
      this.setState({ progress: false });
    }
  };

  handleRealmChange = (value: string) => this.setState({ realmInputValue: value });


  /*
  Getting random colors from defined constant colors
  Pushing to same existingColors so we don't have to check in both arrays
  */
  getArrayOf4Colors = () => {
    let existingColors = this.props.route.params.existingColors ?? []
    let colorItems = []

    while (colorItems.length < 6) {
      let rcolor = ReadableColors.random()
      if (!existingColors.includes(rcolor.color)) {
        colorItems.push(rcolor)
        existingColors.push(rcolor.color)
      }
    }
    this.setState({ selectedColor: colorItems[0]['color'], colors: colorItems })

  }

  componentDidMount() {
    const { initialRealmInputValue, serverColor } = this.props;

    if (!serverColor) { this.getArrayOf4Colors(); }

    if (initialRealmInputValue && initialRealmInputValue.length > 0) {
      this.tryRealm();
    }
  }

  render() {
    const { initialRealmInputValue, navigation } = this.props;
    const { progress, error, realmInputValue, selectedColor, colors } = this.state;
    const styles = {
      input: { marginTop: 16, marginBottom: 8 },
      hintText: { paddingLeft: 2, fontSize: 12 },
      button: { marginTop: 8 },
    };

    return (
      <Screen
        title="Welcome"
        canGoBack={!this.props.route.params.initial}
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
        {colors &&
          (<CololPicker
            selectedValue={selectedColor}
            onValueChange={(value) => { this.setState({ selectedColor: value }) }}
            style={styles.input}
          >
            <CololPicker.Item label={colors[0].label} value={colors[0].color} color={colors[0].color} />
            <CololPicker.Item label={colors[1].label} value={colors[1].color} color={colors[1].color} />
            <CololPicker.Item label={colors[2].label} value={colors[2].color} color={colors[2].color} />
            <CololPicker.Item label={colors[3].label} value={colors[3].color} color={colors[3].color} />
          </CololPicker>)}

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
  initialRealmInputValue: props.route.params.realm?.toString() ?? '',
  serverColor: props.route.params.serverColor?.toString() ?? null,
}))(RealmInputScreen);
