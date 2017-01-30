import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  inline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  block: {

  },
  ul: {
    flexDirection: 'column',
  },
  ol: {
    flexDirection: 'column',
  },
  div: {
  },
  p: {
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
    borderColor: 'green',
    borderWidth: 1,
  },
  k: {
    color: '#008000',
    fontWeight: 'bold',
  },
});
