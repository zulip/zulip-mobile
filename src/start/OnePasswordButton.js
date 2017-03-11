import React from 'react';
import { View, Image } from 'react-native';
import Touchable from '../common/Touchable';

export default class OnePasswordButton extends React.PureComponent {

  props: {
    hidden: boolean,
    handlePress: () => void,
  };

  render() {
    return (
      <View>
        {!this.props.hidden &&
        <Touchable onPress={this.props.handlePress}>
          <Image
            source={require('../../node_modules/1PasswordExtension/1Password.xcassets/onepassword-button.imageset/onepassword-button.png')}
          />
        </Touchable>
        }
      </View>
    );
  }
}
