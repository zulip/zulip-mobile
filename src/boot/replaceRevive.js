/* @flow strict-local */
import invariant from 'invariant';
import Immutable from 'immutable';

import { ZulipVersion } from '../utils/zulipVersion';
import { GravatarURL, UploadedAvatarURL, FallbackAvatarURL } from '../utils/avatar';

/**
 * PRIVATE: Exported only for tests.
 *
 * A special identifier for the type of thing to be replaced/revived.
 *
 * Use this in the replacer and reviver, below, to make it easier to
 * be consistent between them and avoid costly typos.
 */
export const SERIALIZED_TYPE_FIELD_NAME: '__serializedType__' = '__serializedType__';

/**
 * Like SERIALIZED_TYPE_FIELD_NAME, but with a distinguishing mark.
 *
 * Used in our strategy to ensure successful round-tripping when data
 * has a key identical to SERIALIZED_TYPE_FIELD_NAME.
 */
const SERIALIZED_TYPE_FIELD_NAME_ESCAPED: '__serializedType__value' = '__serializedType__value';

// Don't make this an arrow function -- we need `this` to be a special
// value; see
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter.
const replacer = function replacer(key, value) {
  // The value at the current path before JSON.stringify called its
  // `toJSON` method, if present.
  //
  // When identifying what kind of thing we're working with, be sure
  // to examine `origValue` instead of `value`, if calling `toJSON` on
  // that kind of thing would remove its identifying features -- which
  // is to say, if that kind of thing has a `toJSON` method.
  //
  // For things that have a `toJSON` method, it may be convenient to
  // set `data` to `value`, if we trust that `toJSON` gives the output
  // we want to store there. And it would mean we don't discard the
  // work `JSON.stringify` did by calling `toJSON`.
  const origValue = this[key];
  if (value instanceof ZulipVersion) {
    return { data: value.raw(), [SERIALIZED_TYPE_FIELD_NAME]: 'ZulipVersion' };
  } else if (origValue instanceof URL) {
    return { data: origValue.toString(), [SERIALIZED_TYPE_FIELD_NAME]: 'URL' };
  } else if (value instanceof GravatarURL) {
    return { data: GravatarURL.serialize(value), [SERIALIZED_TYPE_FIELD_NAME]: 'GravatarURL' };
  } else if (value instanceof UploadedAvatarURL) {
    return {
      data: UploadedAvatarURL.serialize(value),
      [SERIALIZED_TYPE_FIELD_NAME]: 'UploadedAvatarURL',
    };
  } else if (value instanceof FallbackAvatarURL) {
    return {
      data: FallbackAvatarURL.serialize(value),
      [SERIALIZED_TYPE_FIELD_NAME]: 'FallbackAvatarURL',
    };
  } else if (Immutable.Map.isMap(origValue)) {
    return { data: value, [SERIALIZED_TYPE_FIELD_NAME]: 'ImmutableMap' };
  }

  if (typeof origValue === 'object' && origValue !== null) {
    // Don't forget to handle a value's `toJSON` method, if present, as
    // described above.
    invariant(typeof origValue.toJSON !== 'function', 'unexpected toJSON');

    // If storing an interesting data type, don't forget to handle it
    // here, and in `reviver`.
    const origValuePrototype = Object.getPrototypeOf(origValue);
    invariant(
      // Flow bug: https://github.com/facebook/flow/issues/6110
      origValuePrototype === (Object.prototype: $FlowFixMe)
        || origValuePrototype === (Array.prototype: $FlowFixMe),
      'unexpected class',
    );
  }

  if (typeof value === 'object' && value !== null && SERIALIZED_TYPE_FIELD_NAME in value) {
    const copy = { ...value };
    delete copy[SERIALIZED_TYPE_FIELD_NAME];
    return {
      [SERIALIZED_TYPE_FIELD_NAME]: 'Object',
      data: copy,
      [SERIALIZED_TYPE_FIELD_NAME_ESCAPED]: value[SERIALIZED_TYPE_FIELD_NAME],
    };
  }

  return value;
};

const reviver = function reviver(key, value) {
  if (value !== null && typeof value === 'object' && SERIALIZED_TYPE_FIELD_NAME in value) {
    const data = value.data;
    switch (value[SERIALIZED_TYPE_FIELD_NAME]) {
      case 'ZulipVersion':
        return new ZulipVersion(data);
      case 'URL':
        return new URL(data);
      case 'GravatarURL':
        return GravatarURL.deserialize(data);
      case 'UploadedAvatarURL':
        return UploadedAvatarURL.deserialize(data);
      case 'FallbackAvatarURL':
        return FallbackAvatarURL.deserialize(data);
      case 'ImmutableMap':
        return Immutable.Map(data);
      case 'Object':
        return {
          ...data,
          [SERIALIZED_TYPE_FIELD_NAME]: value[SERIALIZED_TYPE_FIELD_NAME_ESCAPED],
        };
      default:
        return data;
    }
  }
  return value;
};

export const stringify = function stringify(data: mixed): string {
  const result = JSON.stringify(data, replacer);
  if (result === undefined) {
    // Flow says that the output for JSON.stringify could be
    // undefined. From MDN:
    //
    // `JSON.stringify()` can return `undefined` when passing in
    // "pure" values like `JSON.stringify(function(){})` or
    // `JSON.stringify(undefined)`.
    //
    // We don't expect any of those inputs, but we'd want to know if
    // we get one, since it means something has gone quite wrong.
    throw new Error('undefined result for stringify');
  }
  return result;
};

export const parse = function parse(data: string): mixed {
  return JSON.parse(data, reviver);
};
