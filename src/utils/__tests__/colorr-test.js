import 'react-native';
import { foregroundColorFromBackground } from '../color';

describe('foregroundColorFromBackground', () => {
  test('returns "black" for light backgrounds', () => {
    expect(foregroundColorFromBackground('#ffffff')).toEqual('black');
    expect(foregroundColorFromBackground('#aaaaaa')).toEqual('black');
    expect(foregroundColorFromBackground('#8090a0')).toEqual('black');
  });

  test('returns "white" for dark backgrounds', () => {
    expect(foregroundColorFromBackground('#000000')).toEqual('white');
    expect(foregroundColorFromBackground('#333333')).toEqual('white');
    expect(foregroundColorFromBackground('#0000f0')).toEqual('white');
  });
});
