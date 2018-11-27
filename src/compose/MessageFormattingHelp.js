/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  table: {},
  thead: {},
  tr: {
    flexDirection: 'row',
  },
  th: {
    color: 'white',
    backgroundColor: '#333',
  },
  td: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default class MessageFormattingHelp extends PureComponent<{}> {
  render() {
    return (
      <View style={styles.table}>
        <View style={styles.thead}>
          <View style={styles.tr}>
            <Text style={[styles.th, styles.td]}>You type</Text>
            <Text style={[styles.th, styles.td]}>You get</Text>
          </View>
        </View>
        <View>
          <View style={styles.tr}>
            <Text style={styles.td}>**bold**</Text>
            <Text style={[styles.td, styles.bold]}>bold</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>[Zulip](https://zulip.com)</Text>
            <Text style={styles.td}>Zulip</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>TODO</Text>
            <Text style={styles.td}>TODO</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>:heart:</Text>
            <Text style={styles.td}>TODO</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>@**Joe Smith**</Text>
            <Text style={styles.td}>TODO</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>@**all**</Text>
            <Text style={styles.td}>@all (notifies all recipients)</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>Some inline `code`</Text>
            <Text style={styles.td}>Some inline code</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>{'```\ndef zulip():\n  print "Zulip"\n````'}</Text>
            <Text style={styles.td}>TODO</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>{'``` .py\ndef zulip():\n  print "Zulip"\n````'}</Text>
            <Text style={styles.td}>TODO</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>
              You can also make a code block by indenting each line with 4 spaces.
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>&gt; Quoted</Text>
            <Text style={styles.td}>Quoted</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.td}>``` quote Quoted block ```</Text>
            <Text style={styles.td}>Quoted block</Text>
          </View>
          <View style={styles.tr}>
            <Text>You can also make tables with this Markdown-like table syntax.</Text>
          </View>
        </View>
      </View>
    );
  }
}
