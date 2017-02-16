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
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderLeftWidth: 4,
    paddingLeft: 4,
  },
  emoji: {
    width: 24,
    height: 24,
  },
});
