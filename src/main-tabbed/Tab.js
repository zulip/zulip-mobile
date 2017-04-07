import React from 'react';
import {StyleSheet, TouchableHighlight, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {HIGHLIGHT_COLOR} from '../common/styles';

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCircle: {
    position: 'absolute',
    top: 0,
    left: 18,
    backgroundColor: 'red',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    width: 14,
    height: 14,
  },
  activityValue: {
    color: 'white',
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: 8,
    width: 16,
    height: 10,
  },
});

export default class Tab extends React.Component {
  props: {
    activity: number,
    index: number,
  };

  handlePress = () => this.props.onPress(this.props.index);

  render() {
    const {activity, icon} = this.props;

    return (
      <TouchableHighlight
        style={styles.tab}
        underlayColor={HIGHLIGHT_COLOR}
        onPress={this.handlePress}
      >
        <View>
          <Icon name={icon} size={22} color="white" />
          {activity > 0 &&
            <View style={styles.activityCircle}>
              <Text style={styles.activityValue}>
                {activity}
              </Text>
            </View>}
        </View>
      </TouchableHighlight>
    );
  }
}
