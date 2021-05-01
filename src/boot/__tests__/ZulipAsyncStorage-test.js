/* @flow strict-local */
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ZulipAsyncStorage from '../ZulipAsyncStorage';
import * as logging from '../../utils/logging';
import * as eg from '../../__tests__/lib/exampleData';

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

describe('getItem', () => {
  const key = 'foo!';
  const value = '123!';
  const callback = jest.fn();
  beforeEach(() => callback.mockClear());

  // For checking that AsyncStorage.getItem is called in ways we expect.
  const asyncStorageGetItemSpy = jest.spyOn(AsyncStorage, 'getItem');
  beforeEach(() => asyncStorageGetItemSpy.mockClear());

  beforeAll(async () => {
    // `AsyncStorage` mocks storage by writing to a variable instead
    // of to the disk. Put something there for our
    // `ZulipAsyncStorage.getItem` to retrieve.
    await AsyncStorage.setItem(
      key,
      Platform.OS === 'ios' ? value : await NativeModules.TextCompressionModule.compress(value),
    );

    // suppress `logging.error` output
    // $FlowFixMe - teach Flow about mocks
    logging.error.mockReturnValue();
  });

  const run = async () => ZulipAsyncStorage.getItem(key, callback);

  describe('success', () => {
    // AsyncStorage provides its own mock for `.getItem`, which gives
    // success every time. So, no need to mock that behavior
    // ourselves.

    test('calls AsyncStorage.getItem as we expect it to', async () => {
      await run();
      expect(asyncStorageGetItemSpy).toHaveBeenCalledTimes(1);
      expect(asyncStorageGetItemSpy).toHaveBeenCalledWith(key);
    });

    test('resolves correctly', async () => {
      await expect(run()).resolves.toBe(value);
    });

    test('callback called correctly', async () => {
      await run();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null, value);
    });
  });

  describe('failure', () => {
    // AsyncStorage provides its own mock for `.getItem`, but it's
    // not set up to simulate failure. So, mock that behavior
    // ourselves.
    const globalMock = AsyncStorage.getItem;
    beforeEach(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.getItem = jest.fn(
        async (k: string, cb?: ?(e: ?Error, r: string | null) => void): Promise<string | null> => {
          const error = new Error();
          if (cb) {
            cb(error, null);
          }
          throw error;
        },
      );
    });
    afterAll(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.getItem = globalMock;
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
      expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
    });
  });

  if (Platform.OS === 'android') {
    describe('android', () => {
      test('panics when value is in unknown compression format', async () => {
        const unknownHeader = 'z|mock-unknown-format|';

        await AsyncStorage.setItem(
          `${key}-unknown`,
          `${unknownHeader}${Buffer.from('123!').toString('hex')}`,
        );

        await expect(ZulipAsyncStorage.getItem(`${key}-unknown`, callback)).rejects.toThrow(
          `No decompression module found for format ${unknownHeader}`,
        );
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
      });
    });
  }
});

describe('setItem/getItem together', () => {
  test('round-tripping works', async () => {
    const key = eg.randString();
    const value = eg.randString();

    // AsyncStorage provides its own mocks for `.getItem` and
    // `.setItem`; it writes to a variable instead of storage.
    await ZulipAsyncStorage.setItem(key, value);
    expect(await ZulipAsyncStorage.getItem(key)).toEqual(value);
  });
});
