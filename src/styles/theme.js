/* @flow */
import { Platform } from 'react-native';
import { BORDER_COLOR, BRAND_COLOR, CONTROL_SIZE, NAVBAR_SIZE } from './';

type Props = {
  color: string,
  backgroundColor: string,
  borderColor: string,
  cardColor: string,
};

export default ({ color, backgroundColor, borderColor, cardColor }: Props) => ({
  text: {
    fontSize: 16,
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
    height: CONTROL_SIZE,
    ...Platform.select({
      ios: {
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 2,
        padding: 8,
      },
    }),
  },
  composeTextInput: {
    color,
    borderColor: 'transparent',
    // flex: 1,
    padding: 6,
    fontSize: 15,
  },
  background: {
    backgroundColor,
  },
  label: {
    color,
    fontSize: 15,
  },
  padding: {
    padding: 8,
  },
  icon: {
    color,
    width: 24,
    height: 24,
    margin: 8,
    fontSize: 24,
    textAlign: 'center',
  },
  item: {
    flex: 1,
    flexBasis: CONTROL_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
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
  messageList: {
    flex: 1,
  },
  webview: {
    borderWidth: 0,
    backgroundColor,
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
  marginBottom: {
    marginBottom: 10,
  },
  navBar: {
    backgroundColor,
    borderColor,
    flexDirection: 'row',
    height: NAVBAR_SIZE,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  navTitle: {
    color: BRAND_COLOR,
    textAlign: 'center',
    fontSize: 16,
  },
  composeBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
    borderTopColor: borderColor,
  },
  subheader: {
    flex: 1,
    flexBasis: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 16,
  },
  cardView: {
    backgroundColor: cardColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  lineSeparator: {
    height: 1,
    backgroundColor: cardColor,
    margin: 4,
  },
  smallMarginTop: {
    marginTop: 8,
  },
  floatingView: {
    position: 'absolute',
    width: '100%',
  },
});
