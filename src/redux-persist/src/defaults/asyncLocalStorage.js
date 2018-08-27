import setImmediate from '../utils/setImmediate';
import { logErrorRemotely } from '../../../utils/logging';

let noStorage = () => /* noop */ null;
if (process.env.NODE_ENV !== 'production') {
  noStorage = () => {
    logErrorRemotely(
      new Error(
        'redux-persist asyncLocalStorage requires a global localStorage object. Either use a different storage backend or if this is a universal redux application you probably should conditionally persist like so: https://gist.github.com/rt2zz/ac9eb396793f95ff3c3b',
      ),
    );
    return null;
  };
}

function hasStorage(storageType) {
  if (typeof window !== 'object' || !(storageType in window)) {
    return false;
  }

  try {
    const storage = window[storageType];
    const testKey = `redux-persist ${storageType} test`;
    storage.setItem(testKey, 'test');
    storage.getItem(testKey);
    storage.removeItem(testKey);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      logErrorRemotely(
        new Error(`redux-persist ${storageType} test failed, persistence will be disabled.`),
      );
    }
    return false;
  }
  return true;
}

function hasLocalStorage() {
  return hasStorage('localStorage');
}

function hasSessionStorage() {
  return hasStorage('sessionStorage');
}

function getStorage(type) {
  let storage;
  if (type === 'local') {
    storage = hasLocalStorage()
      ? window.localStorage
      : { getItem: noStorage, setItem: noStorage, removeItem: noStorage, getAllKeys: noStorage };
  }
  if (type === 'session') {
    storage = hasSessionStorage()
      ? window.sessionStorage
      : { getItem: noStorage, setItem: noStorage, removeItem: noStorage, getAllKeys: noStorage };
  }
  return storage;
}

export default function (type, config) {
  const storage = getStorage(type);
  return {
    getAllKeys(cb) {
      return new Promise((resolve, reject) => {
        try {
          const keys = [];
          for (let i = 0; i < storage.length; i++) {
            keys.push(storage.key(i));
          }
          setImmediate(() => {
            if (cb) {
              cb(null, keys);
            }
            resolve(keys);
          });
        } catch (e) {
          if (cb) {
            cb(e);
          }
          reject(e);
        }
      });
    },
    getItem(key, cb) {
      return new Promise((resolve, reject) => {
        try {
          const s = storage.getItem(key);
          setImmediate(() => {
            if (cb) {
              cb(null, s);
            }
            resolve(s);
          });
        } catch (e) {
          if (cb) {
            cb(e);
          }
          reject(e);
        }
      });
    },
    setItem(key, string, cb) {
      return new Promise((resolve, reject) => {
        try {
          storage.setItem(key, string);
          setImmediate(() => {
            if (cb) {
              cb(null);
            }
            resolve();
          });
        } catch (e) {
          if (cb) {
            cb(e);
          }
          reject(e);
        }
      });
    },
    removeItem(key, cb) {
      return new Promise((resolve, reject) => {
        try {
          storage.removeItem(key);
          setImmediate(() => {
            if (cb) {
              cb(null);
            }
            resolve();
          });
        } catch (e) {
          if (cb) {
            cb(e);
          }
          reject(e);
        }
      });
    },
  };
}
