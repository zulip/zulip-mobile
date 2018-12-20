/* @flow strict-local */
import { Platform } from 'react-native';

import { BORDER_COLOR, BRAND_COLOR, CONTROL_SIZE } from './constants';

export const statics = {
  largerText: {
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
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
  link: {
    marginTop: 10,
    fontSize: 15,
    color: BRAND_COLOR,
    textAlign: 'right',
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

type Props = {|
  color: string,
  backgroundColor: string,
  borderColor: string,
  cardColor: string,
  dividerColor: string,
|};

export default ({ color, backgroundColor, borderColor, cardColor, dividerColor }: Props) => ({
  color: {
    color,
  },
  backgroundColor: {
    backgroundColor,
  },
  input: {
    color,
    ...Platform.select({
      ios: {
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 2,
        padding: 8,
      },
    }),
  },
  background: {
    backgroundColor,
  },
  label: {
    color,
    fontSize: 15,
  },
  icon: {
    color,
    width: 24,
    height: 24,
    margin: 8,
    fontSize: 24,
    textAlign: 'center',
  },
  screen: {
    flex: 1,
    flexDirection: 'column',
    // alignItems: 'stretch',
    backgroundColor,
  },
  webview: {
    borderWidth: 0,
    backgroundColor,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: dividerColor,
  },
  lineSeparator: {
    height: 1,
    backgroundColor: cardColor,
    margin: 4,
  },
});
