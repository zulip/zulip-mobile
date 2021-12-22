/* @flow strict-local */
import { Platform, NativeModules } from 'react-native';
import { AsyncStorage, BaseAsyncStorage } from '../AsyncStorage';
import { CompressedAsyncStorageImpl } from '../CompressedAsyncStorage';
import * as logging from '../../utils/logging';
import * as eg from '../../__tests__/lib/exampleData';

const CompressedAsyncStorage = new CompressedAsyncStorageImpl(0, []);

describe('setItem', () => {
  const key = 'foo!';
  const value = '123!';

  // For checking that AsyncStorage.setItem is called in ways we expect.
  const asyncStorageSetItemSpy = jest.spyOn(BaseAsyncStorage.prototype, 'setItem');
  beforeEach(() => asyncStorageSetItemSpy.mockClear());

  const run = async () => CompressedAsyncStorage.setItem(key, value);

  describe('success', () => {
    test('resolves correctly', async () => {
      await expect(run()).resolves.toBe(undefined);
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
    // Mock `.setItem` to simulate failure, and reset when we're done.
    const globalMock = BaseAsyncStorage.prototype.setItem;
    beforeEach(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      BaseAsyncStorage.prototype.setItem = jest.fn(async (k: string, v: string): Promise<null> => {
        throw new Error();
      });
    });
    afterAll(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      BaseAsyncStorage.prototype.setItem = globalMock;
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
  const asyncStorageMultiSetSpy = jest.spyOn(BaseAsyncStorage.prototype, 'multiSet');
  beforeEach(() => asyncStorageMultiSetSpy.mockClear());

  const run = async () => CompressedAsyncStorage.multiSet(keyValuePairs);

  describe('success', () => {
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
    // Mock `.multiSet` to simulate failure, and reset when we're done.
    const globalMock = BaseAsyncStorage.prototype.multiSet;
    beforeEach(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      BaseAsyncStorage.prototype.multiSet = jest.fn(async (p: string[][]): Promise<null> => {
        throw new Error();
      });
    });
    afterAll(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      BaseAsyncStorage.prototype.multiSet = globalMock;
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
  const asyncStorageGetItemSpy = jest.spyOn(BaseAsyncStorage.prototype, 'getItem');
  beforeEach(() => asyncStorageGetItemSpy.mockClear());

  beforeAll(async () => {
    // Store something in `AsyncStorage` for our
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
    // Mock `.getItem` to simulate failure, and reset when we're done.
    const globalMock = BaseAsyncStorage.prototype.getItem;
    beforeEach(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      BaseAsyncStorage.prototype.getItem = jest.fn(async (k: string): Promise<string | null> => {
        throw new Error();
      });
    });
    afterAll(() => {
      // $FlowFixMe[cannot-write] Make Flow understand about mocking.
      BaseAsyncStorage.prototype.getItem = globalMock;
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
