/* @flow */
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  blockquote: {
    marginTop: 0,
    marginBottom: 0,
  },
  p: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  span: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  li: {
    flexWrap: 'wrap',
  },
  math: {
    flexDirection: 'row',
  },
  mrow: {
    flexDirection: 'row',
  },
  msup: {
    flexDirection: 'row',
  },
  mfrac: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pre: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
});
