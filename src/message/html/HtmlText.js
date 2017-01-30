import React from 'react';
import entities from 'entities';
import { Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 22,
  }
});

export default class HtmlText extends React.PureComponent {
  render() {
    const { data } = this.props;

    return (
      <Text style={styles.text}>
        {entities.decodeHTML(data)}
      </Text>
    );
  }
}
