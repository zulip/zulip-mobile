/* @flow strict-local */
import { Platform } from 'react-native';

import type { Style } from '../types';
import { BORDER_COLOR, BRAND_COLOR, CONTROL_SIZE } from './';

export type MiscStyles = {
  text: Style,
  largerText: Style,
  color: Style,
  backgroundColor: Style,
  row: Style,
  input: Style,
  passwordInput: Style,
  showPasswordButton: Style,
  showPasswordButtonText: Style,
  realmInput: Style,
  realmPlaceholder: Style,
  realmInputEmpty: Style,
  background: Style,
  label: Style,
  icon: Style,
  settingsIcon: Style,
  listItem: Style,
  screen: Style,
  flexed: Style,
  flexDirectionColumnReversed: Style,
  flexedLeftAlign: Style,
  messageList: Style,
  webview: Style,
  rightItem: Style,
  link: Style,
  divider: Style,
  container: Style,
  center: Style,
  heading2: Style,
  field: Style,
  lineSeparator: Style,
  alignBottom: Style,
};

type Props = {|
  color: string,
  backgroundColor: string,
  borderColor: string,
  cardColor: string,
  dividerColor: string,
|};

export default ({ color, backgroundColor, borderColor, cardColor, dividerColor }: Props) => ({
  largerText: {
    fontSize: 20,
  },
  color: {
    color,
  },
  backgroundColor: {
    backgroundColor,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  screen: {
    flex: 1,
    flexDirection: 'column',
    // alignItems: 'stretch',
    backgroundColor,
  },
  flexed: {
    flex: 1,
  },
  flexDirectionColumnReversed: { flexDirection: 'column-reverse' },
  flexedLeftAlign: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  webview: {
    borderWidth: 0,
    backgroundColor,
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: dividerColor,
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
  lineSeparator: {
    height: 1,
    backgroundColor: cardColor,
    margin: 4,
  },
  alignBottom: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
