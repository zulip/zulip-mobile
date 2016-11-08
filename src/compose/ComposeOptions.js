import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  icon: {
    padding: 4,
    color: '#999',
  },
});

export default class ComposeOptions extends React.Component {


  handleSend = () => {
    this.props.onSend(this.state.text);
    this.setState({ text: '' });
  }

  render() {
    return (
      <View style={styles.container}>
        <Icon style={styles.icon} size={22} name="md-image" />
        <Icon style={styles.icon} size={22} name="md-camera" />
        <Icon style={styles.icon} size={22} name="md-videocam" />
        <Icon style={styles.icon} size={22} name="md-happy" />
      </View>
    );
  }
}
