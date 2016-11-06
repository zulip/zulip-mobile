import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default class Tab extends React.Component {

  props: {
    index: number;
  }

  handlePress = () =>
    this.props.onPress(this.props.index);

  render() {
    const { icon } = this.props;

    return (
      <TouchableOpacity activeOpacity={0.2} style={styles.tab} onPress={this.handlePress}>
        <Icon
          name={icon}
          size={22}
          color="white"
        />
      </TouchableOpacity>
    );
  }
}
