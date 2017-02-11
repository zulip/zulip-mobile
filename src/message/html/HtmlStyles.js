import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  ul: {
    flexDirection: 'column',
  },
  ol: {
    flexDirection: 'column',
  },
  div: {},
  p: {
    marginTop: 4,
    marginBottom: 4,
  },
  li: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  span: {
  },
  a: {
  },
  'user-mention': {
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#eee',
    borderRadius: 3,
    paddingLeft: 4,
    paddingRight: 4,
  },
  'user-mention-me': {
    backgroundColor: '#c9fcc1', // eslint-disable-line
  },
  code: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#e5e5e5',
    paddingLeft: 4,
    paddingRight: 4,
  },
  pre: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#e5e5e5',
    padding: 8,
    overflow: 'scroll',
  },
  table: {
    flexDirection: 'column',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  thead: {
    flexDirection: 'column',
    backgroundColor: '#eee',
  },
  tbody: {
    flexDirection: 'column',
  },
  tr: {
    flexDirection: 'row',
  },
  th: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  td: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockquote: {
    borderLeftColor: '#ddd',
    borderLeftWidth: 5,
    marginLeft: 5,
    paddingLeft: 5,
  },
  emoji: {
    width: 24,
    height: 24,
  },
});
