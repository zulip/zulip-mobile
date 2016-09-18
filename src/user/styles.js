import { StyleSheet } from 'react-native';

const STATUS_BAR_HEIGHT = 20;
const FIELD_HEIGHT = 44;

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: STATUS_BAR_HEIGHT,
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  heading1: {
    fontSize: 24,
  },
  label: {
    fontSize: 15,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: FIELD_HEIGHT,
    marginTop: 10,
  },
  smallField: {
    flexDirection: 'row',
    height: FIELD_HEIGHT / 2,
    marginRight: 10,
  },
  error: {
    color: 'red',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
  },
});
