import { foregroundColorFromBackground } from '../color';

describe('foregroundColorFromBackground', () => {
  test('returns "black" for light backgrounds', () => {
    expect(foregroundColorFromBackground('#ffffff')).toEqual('black');
    expect(foregroundColorFromBackground('lightgray')).toEqual('black');
    expect(foregroundColorFromBackground('#b0b0b0')).toEqual('black');
  });

  test('returns "white" for dark backgrounds', () => {
    expect(foregroundColorFromBackground('#000000')).toEqual('white');
    expect(foregroundColorFromBackground('#333333')).toEqual('white');
    expect(foregroundColorFromBackground('#0000f0')).toEqual('white');
  });
});
