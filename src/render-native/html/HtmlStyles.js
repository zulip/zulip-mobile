/* @flow */
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  common: {
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ul: {
    width: '100%',
    flexDirection: 'column',
    paddingTop: 4,
    paddingBottom: 4,
  },
  ol: {
    flexDirection: 'column',
  },
  li: {
    flexDirection: 'row',
    marginBottom: 4,
    justifyContent: 'space-around',
    alignItems: 'stretch',
    flexWrap: 'wrap',
  },
  div: {
    flexWrap: 'wrap',
  },
  p: {},
  br: {
    width: '100%',
  },
  span: {},
  bullet: {
    fontSize: 32,
  },
  a: {},
  b: {},
  i: {},
  'user-mention': {
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    paddingLeft: 4,
    paddingRight: 4,
  },
  'user-mention-me': {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  highlight: {
    backgroundColor: 'rgba(255, 255, 0, 0.5)',
  },
  code: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderRadius: 3,
    paddingLeft: 4,
    paddingRight: 4,
  },
  pre: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderRadius: 3,
    padding: 8,
    overflow: 'scroll',
  },
  table: {
    flexDirection: 'column',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
  },
  thead: {
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tbody: {
    flexDirection: 'column',
  },
  tr: {
    flexDirection: 'row',
  },
  th: {
    flex: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  td: {
    flex: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockquote: {
    borderColor: 'rgba(127, 127, 127, 0.25)',
    borderLeftWidth: 4,
    paddingLeft: 4,
    alignItems: 'flex-start',
  },
  emoji: {
    width: 24,
    height: 24,
  },
});
