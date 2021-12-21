/* @flow strict-local */
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CompressedAsyncStorage from '../CompressedAsyncStorage';
import * as logging from '../../utils/logging';
import * as eg from '../../__tests__/lib/exampleData';

describe('setItem', () => {
  const key = 'foo!';
  const value = '123!';

  // For checking that AsyncStorage.setItem is called in ways we expect.
  const asyncStorageSetItemSpy = jest.spyOn(AsyncStorage, 'setItem');
  beforeEach(() => asyncStorageSetItemSpy.mockClear());

  const run = async () => CompressedAsyncStorage.setItem(key, value);

  describe('success', () => {
    // AsyncStorage provides its own mock for `.setItem`, which gives
    // success every time. So, no need to mock that behavior
    // ourselves.

    test('resolves correctly', async () => {
      await expect(run()).resolves.toBe(null);
    });

    test('AsyncStorage.setItem called correctly', async () => {
      await run();
      expect(asyncStorageSetItemSpy).toHaveBeenCalledTimes(1);
      expect(asyncStorageSetItemSpy).toHaveBeenCalledWith(
        key,
        Platform.OS === 'ios' ? value : await NativeModules.TextCompressionModule.compress(value),
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
      AsyncStorage.setItem = jest.fn(async (k: string, v: string): Promise<null> => {
        throw new Error();
      });
    });
    afterAll(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.setItem = globalMock;
    });

    test('rejects correctly', async () => {
      await expect(run()).rejects.toThrow(Error);
    });
  });
});

describe('multiSet', () => {
  const keyValuePairs = [
    ['foo', JSON.stringify('bar')],
    ['food', JSON.stringify('bard')],
  ];

  // For checking that AsyncStorage.multiSet is called in ways we expect.
  const asyncStorageMultiSetSpy = jest.spyOn(AsyncStorage, 'multiSet');
  beforeEach(() => asyncStorageMultiSetSpy.mockClear());

  const run = async () => CompressedAsyncStorage.multiSet(keyValuePairs);

  describe('success', () => {
    // AsyncStorage provides its own mock for `.multiSet`, which gives
    // success every time. So, no need to mock that behavior
    // ourselves.

    test('resolves correctly', async () => {
      await run();
      expect(asyncStorageMultiSetSpy).toHaveBeenCalledTimes(1);
      expect(asyncStorageMultiSetSpy).toHaveBeenCalledWith(
        Platform.OS === 'ios'
          ? keyValuePairs
          : await Promise.all(
              keyValuePairs.map(async ([key, value]) => [
                key,
                await NativeModules.TextCompressionModule.compress(value),
              ]),
            ),
      );
    });
  });

  describe('failure', () => {
    // AsyncStorage provides its own mock for `.multiSet`, but it's
    // not set up to simulate failure. So, mock that behavior
    // ourselves, and reset to the global mock when we're done.
    const globalMock = AsyncStorage.multiSet;
    beforeEach(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.multiSet = jest.fn(async (p: string[][]): Promise<null> => {
        throw new Error();
      });
    });
    afterAll(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.multiSet = globalMock;
    });

    test('rejects correctly', async () => {
      await expect(run()).rejects.toThrow(Error);
    });
  });
});

describe('getItem', () => {
  const key = 'foo!';
  const value = '123!';

  // For checking that AsyncStorage.getItem is called in ways we expect.
  const asyncStorageGetItemSpy = jest.spyOn(AsyncStorage, 'getItem');
  beforeEach(() => asyncStorageGetItemSpy.mockClear());

  beforeAll(async () => {
    // `AsyncStorage` mocks storage by writing to a variable instead
    // of to the disk. Put something there for our
    // `CompressedAsyncStorage.getItem` to retrieve.
    await AsyncStorage.setItem(
      key,
      Platform.OS === 'ios' ? value : await NativeModules.TextCompressionModule.compress(value),
    );

    // suppress `logging.error` output
    // $FlowFixMe[prop-missing] - teach Flow about mocks
    logging.error.mockReturnValue();
  });

  const run = async () => CompressedAsyncStorage.getItem(key);

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
  });

  describe('failure', () => {
    // AsyncStorage provides its own mock for `.getItem`, but it's
    // not set up to simulate failure. So, mock that behavior
    // ourselves.
    const globalMock = AsyncStorage.getItem;
    beforeEach(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.getItem = jest.fn(async (k: string): Promise<string | null> => {
        throw new Error();
      });
    });
    afterAll(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      AsyncStorage.getItem = globalMock;
    });

    test('rejects correctly', async () => {
      await expect(run()).rejects.toThrow(Error);
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

        await expect(CompressedAsyncStorage.getItem(`${key}-unknown`)).rejects.toThrow(
          `No decompression module found for format ${unknownHeader}`,
        );
      });
    });
  }
});

describe('set/get together', () => {
  // AsyncStorage provides its own mocks for `.getItem`, `.setItem`, and
  // `.multiSet`; it writes to a variable instead of storage.

  test('round-tripping of single key-value pair works', async () => {
    const key = eg.randString();
    const value = JSON.stringify(eg.randString());
    await CompressedAsyncStorage.setItem(key, value);
    expect(await CompressedAsyncStorage.getItem(key)).toEqual(value);
  });

  test('round-tripping of multiple key-value pairs works', async () => {
    const keyValuePairs = [
      [eg.randString(), JSON.stringify(eg.randString())],
      [eg.randString(), JSON.stringify(eg.randString())],
    ];
    await CompressedAsyncStorage.multiSet(keyValuePairs);
    expect(
      await Promise.all(
        keyValuePairs.map(async ([key, _]) => [key, await CompressedAsyncStorage.getItem(key)]),
      ),
    ).toEqual(keyValuePairs);
  });
});
