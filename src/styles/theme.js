/* @flow */
import { Platform } from 'react-native';
import { BORDER_COLOR, BRAND_COLOR, STATUSBAR_HEIGHT, CONTROL_SIZE, NAVBAR_HEIGHT } from './';

type Props = {
  color: string,
  backgroundColor: string,
  borderColor: string,
};

export default ({ color, backgroundColor, borderColor }: Props) => ({
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
        flexBasis: CONTROL_SIZE,
        borderColor: BORDER_COLOR,
        borderRadius: 2,
        padding: 8,
      },
    }),
  },
  composeText: {
    color,
    borderColor: 'transparent',
    flex: 1,
    padding: 4,
    paddingLeft: 8,
    fontSize: 16,
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
  item: {
    flex: 1,
    flexBasis: CONTROL_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
  },
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
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
    paddingTop: STATUSBAR_HEIGHT,
    height: NAVBAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  navTitle: {
    flex: 1,
    color: BRAND_COLOR,
    textAlign: 'center',
    fontSize: 16,
  },
  composeBox: {
    backgroundColor,
    borderTopWidth: 1,
    borderTopColor: borderColor,
    zIndex: 2,
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
  composeInput: {
    padding: 5,
    fontSize: 14,
    borderWidth: 0.5,
    height: CONTROL_SIZE * (3 / 4),
    borderColor: BORDER_COLOR,
  },
  topicWrapper: {
    height: 44,
    paddingLeft: 4,
    paddingRight: 4,
  },
});
