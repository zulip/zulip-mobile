/* @flow */
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
  item: Style,
  listItem: Style,
  screen: Style,
  flexed: Style,
  flexedLeftAlign: Style,
  messageList: Style,
  webview: Style,
  rightItem: Style,
  screenWrapper: Style,
  link: Style,
  divider: Style,
  navigationCard: Style,
  container: Style,
  center: Style,
  heading2: Style,
  field: Style,
  disabled: Style,
  username: Style,
  lineSeparator: Style,
  floatingView: Style,
  alignBottom: Style,
};

type Props = {
  color: string,
  backgroundColor: string,
  borderColor: string,
  cardColor: string,
  dividerColor: string,
};

export default ({ color, backgroundColor, borderColor, cardColor, dividerColor }: Props) => ({
  text: {
    fontSize: 16,
  },
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
  item: {
    flex: 1,
    flexBasis: CONTROL_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
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
  flexedLeftAlign: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  messageList: {
    flex: 1,
  },
  webview: {
    borderWidth: 0,
    backgroundColor,
  },
  rightItem: {
    marginLeft: 'auto',
  },
  screenWrapper: {
    flex: 1,
    padding: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
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
  navigationCard: {
    backgroundColor,
    shadowColor: 'transparent',
  },
  container: {
    flex: 1,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading2: {
    fontSize: 20,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    height: CONTROL_SIZE,
    marginTop: 5,
    marginBottom: 5,
  },
  disabled: {
    backgroundColor: '#ddd',
    color: '#333',
  },
  username: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 16,
  },
  lineSeparator: {
    height: 1,
    backgroundColor: cardColor,
    margin: 4,
  },
  floatingView: {
    position: 'absolute',
    width: '100%',
  },
  alignBottom: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
