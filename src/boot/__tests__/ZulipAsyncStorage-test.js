/* @flow strict-local */
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ZulipAsyncStorage from '../ZulipAsyncStorage';

describe('setItem', () => {
  const key = 'foo!';
  const value = '123!';
  const callback = jest.fn();
  beforeEach(() => callback.mockClear());

  // For checking that AsyncStorage.setItem is called in ways we expect.
  const asyncStorageSetItemSpy = jest.spyOn(AsyncStorage, 'setItem');
  beforeEach(() => asyncStorageSetItemSpy.mockClear());

  const run = async () => ZulipAsyncStorage.setItem(key, value, callback);

  describe('success', () => {
    // AsyncStorage provides its own mock for `.setItem`, which gives
    // success every time. So, no need to mock that behavior
    // ourselves.

    test('resolves correctly', async () => {
      await expect(run()).resolves.toBe(null);
    });

    test('callback called correctly', async () => {
      await run();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null);
    });

    test('AsyncStorage.setItem called correctly', async () => {
      await run();
      expect(asyncStorageSetItemSpy).toHaveBeenCalledTimes(1);
      expect(asyncStorageSetItemSpy).toHaveBeenCalledWith(
        key,
        Platform.OS === 'ios' ? value : await NativeModules.TextCompressionModule.compress(value),
        callback,
      );
    });
  });

  describe('failure', () => {
    // AsyncStorage provides its own mock for `.setItem`, but it's
    // not set up to simulate failure. So, mock that behavior
    // ourselves, and reset to the global mock when we're done.
    const globalMock = AsyncStorage.setItem;
    beforeEach(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.setItem = jest.fn(
        async (k: string, v: string, cb?: ?(e: ?Error) => void): Promise<null> => {
          const error = new Error();
          if (cb) {
            cb(error);
          }
          throw error;
        },
      );
    });
    afterAll(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.setItem = globalMock;
    });

    test('rejects correctly', async () => {
      await expect(run()).rejects.toThrow(Error);
    });

    test('callback called correctly', async () => {
      try {
        await run();
      } catch (e) {
        // "rejects correctly" covers this
      }
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
