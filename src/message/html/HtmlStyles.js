import { StyleSheet } from 'react-native';

const inlineContents = {
  flexDirection: 'row',
  // flexWrap: 'wrap',
  alignItems: 'flex-start',
};

export default StyleSheet.create({
  inline: {
  },
  block: {

  },
  ul: {
    flexDirection: 'column',
  },
  ol: {
    flexDirection: 'column',
  },
  div: inlineContents,
  p: inlineContents,
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
    paddingLeft: 4,
    paddingRight: 4,
  },
  table: {
    flexDirection: 'column',
    alignItems: 'stretch',
    borderColor: 'green',
    borderWidth: 1,
    backgroundColor: 'yellow',
  },
  thead: {
    flexDirection: 'column',
    borderColor: 'red',
    borderWidth: 1,
  },
  tbody: {
    flexDirection: 'column',
    borderColor: 'blue',
    borderWidth: 1,
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
  k: {
    color: '#008000',
    fontWeight: 'bold',
  },
});
