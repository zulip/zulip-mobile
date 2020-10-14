/* @flow strict-local */
import React, { PureComponent } from 'react';
import { TextInput, TouchableWithoutFeedback, View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { ThemeData } from '../styles';
import { ThemeContext, createStyleSheet } from '../styles';
import { autocompleteRealmPieces, autocompleteRealm, fixRealmUrl } from '../utils/url';
import type { Protocol } from '../utils/url';
import RawLabel from './RawLabel';

const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    opacity: 0.8,
  },
  realmInput: {
    padding: 0,
    fontSize: 20,
  },
  realmPlaceholder: {
    opacity: 0.75,
  },
  realmInputEmpty: {
    width: 1,
  },
});

type Props = $ReadOnly<{|
  defaultValue: string,
  /**
   * The protocol which will be used if the user doesn't specify one.
   * Should almost certainly be "https://".
   */
  defaultProtocol: Protocol,
  /**
   * The example organization name that will be displayed while the
   * entry field is empty. Appears, briefly, as the initial (lowest-
   * level) component of the realm's domain.
   */
  defaultOrganization: string,
  /**
   * The default domain to which the user's input will be appended, if
   * it appears not to contain an explicit domain.
   */
  defaultDomain: string,
  // TODO: Currently this type is acceptable because the only
  // `navigation` prop we pass to a `SmartUrlInput` instance is the
  // one from a component on AppNavigator.
  navigation: AppNavigationProp<>,
  style?: ViewStyleProp,
  onChangeText: (value: string) => void,
  onSubmitEditing: () => Promise<void>,
  enablesReturnKeyAutomatically: boolean,
|}>;

type State = {|
  /**
   * The actual input string, exactly as entered by the user,
   * without modifications by autocomplete.
   */
  value: string,
|};

export default class SmartUrlInput extends PureComponent<Props, State> {
  static contextType = ThemeContext;
  context: ThemeData;
  state = {
    value: '',
  };
  textInputRef = React.createRef<typeof TextInput>();
  unsubscribeFocusListener: () => void;

  componentDidMount() {
    this.unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
      if (this.textInputRef.current) {
        // Should be fixed in RN v0.63 (#4245); see
        // https://github.com/zulip/zulip-mobile/issues/4245#issuecomment-695104351.
        // $FlowFixMe
        this.textInputRef.current.focus();
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeFocusListener) {
      this.unsubscribeFocusListener();
    }
  }

  handleChange = (value: string) => {
    this.setState({ value });

    const { onChangeText, defaultProtocol: protocol, defaultDomain: domain } = this.props;
    onChangeText(fixRealmUrl(autocompleteRealm(value, { protocol, domain })));
  };

  urlPress = () => {
    const { textInputRef } = this;
    if (textInputRef.current) {
      // Should be fixed in RN v0.63 (#4245); see
      // https://github.com/zulip/zulip-mobile/issues/4245#issuecomment-695104351.
      // $FlowFixMe
      textInputRef.current.blur();
      setTimeout(() => {
        if (textInputRef.current) {
          // $FlowFixMe - same as above
          textInputRef.current.focus();
        }
      }, 100);
    }
  };

  renderPlaceholderPart = (text: string) => (
    <TouchableWithoutFeedback onPress={this.urlPress}>
      <RawLabel
        style={[styles.realmInput, { color: this.context.color }, styles.realmPlaceholder]}
        text={text}
      />
    </TouchableWithoutFeedback>
  );

  render() {
    const {
      defaultValue,
      defaultProtocol,
      defaultOrganization,
      defaultDomain,
      style,
      onSubmitEditing,
      enablesReturnKeyAutomatically,
    } = this.props;
    const { value } = this.state;

    const [prefix, , suffix] = autocompleteRealmPieces(value || defaultValue, {
      domain: defaultDomain,
      protocol: defaultProtocol,
    });

    return (
      <View style={[styles.wrapper, style]}>
        {prefix !== null && this.renderPlaceholderPart(prefix)}
        <TextInput
          style={[
            styles.realmInput,
            { color: this.context.color },
            value.length === 0 && styles.realmInputEmpty,
          ]}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="go"
          defaultValue={defaultValue}
          onChangeText={this.handleChange}
          blurOnSubmit={false}
          keyboardType="url"
          underlineColorAndroid="transparent"
          onSubmitEditing={onSubmitEditing}
          enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
          ref={this.textInputRef}
        />
        {!value && this.renderPlaceholderPart(defaultOrganization)}
        {suffix !== null && this.renderPlaceholderPart(suffix)}
      </View>
    );
  }
}
