/* @flow strict-local */
import { CONTROL_SIZE } from './constants';

export const statics = {
  largerText: {
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  flexed: {
    flex: 1,
  },
  rightItem: {
    marginLeft: 'auto',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    height: CONTROL_SIZE,
    marginTop: 5,
    marginBottom: 5,
  },
  alignBottom: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
};
