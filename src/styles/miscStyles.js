/* @flow strict-local */
import type { ThemeColors } from './theme';
import { CONTROL_SIZE } from './constants';

export const statics = {
  largerText: {
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 24,
    height: 24,
    margin: 8,
    fontSize: 24,
    textAlign: 'center',
    marginLeft: 8,
    marginRight: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
  flexed: {
    flex: 1,
  },
  flexedLeftAlign: {
    flex: 1,
    justifyContent: 'flex-start',
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

export default ({ color, backgroundColor }: ThemeColors) => ({
  backgroundColor: {
    backgroundColor,
  },
  background: {
    backgroundColor,
  },
});
