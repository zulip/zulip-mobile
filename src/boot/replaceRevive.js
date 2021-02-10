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

/**
 * Custom replacer for inventive data types JSON doesn't handle.
 *
 * To be passed to `JSON.stringify` as its second argument. New
 * replacement logic must also appear in `reviver` so they stay in
 * sync.
 */
// Don't make this an arrow function -- we need `this` to be a special
// value; see
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter.
function replacer(key, value) {
  // The value at the current path before JSON.stringify called its
  // `toJSON` method, if present.
  //
  // When identifying what kind of thing we're working with, we
  // examine `origValue` instead of `value`, just in case calling
  // `toJSON` on that kind of thing would remove its identifying
  // features -- which is to say, just in case that kind of thing has
  // a `toJSON` method.
  //
  // For things that have a `toJSON` method, it may be convenient to
  // set `data` to `value`, if we trust that `toJSON` gives the output
  // we want to store there. And it would mean we don't discard the
  // work `JSON.stringify` did by calling `toJSON`.
  const origValue = this[key];

  if (typeof origValue !== 'object' || origValue === null) {
    // `origValue` can't be one of our interesting data types, so,
    // just return it.
    return origValue;
  }

  switch (Object.getPrototypeOf(origValue)) {
    // Flow bug: https://github.com/facebook/flow/issues/6110
    case (ZulipVersion.prototype: $FlowIssue):
      return { data: value.raw(), [SERIALIZED_TYPE_FIELD_NAME]: 'ZulipVersion' };
    case (URL.prototype: $FlowIssue):
      return { data: origValue.toString(), [SERIALIZED_TYPE_FIELD_NAME]: 'URL' };
    case (GravatarURL.prototype: $FlowIssue):
      return { data: GravatarURL.serialize(value), [SERIALIZED_TYPE_FIELD_NAME]: 'GravatarURL' };
    case (UploadedAvatarURL.prototype: $FlowIssue):
      return {
        data: UploadedAvatarURL.serialize(value),
        [SERIALIZED_TYPE_FIELD_NAME]: 'UploadedAvatarURL',
      };
    case (FallbackAvatarURL.prototype: $FlowIssue):
      return {
        data: FallbackAvatarURL.serialize(value),
        [SERIALIZED_TYPE_FIELD_NAME]: 'FallbackAvatarURL',
      };
    case (Immutable.List.prototype: $FlowIssue):
      return { data: value, [SERIALIZED_TYPE_FIELD_NAME]: 'ImmutableList' };
    case (Immutable.Map.prototype: $FlowIssue): {
      const firstKey = origValue.keySeq().first();
      return {
        data: value,
        // We assume that any `Immutable.Map` will have
        //   - all string keys,
        //   - all numeric keys, or
        //   - no keys (be empty).
        //
        // We store string-keyed maps with `ImmutableMap`,
        // number-keyed maps with `ImmutableMapNumKeys`, and empty
        // maps with either one of those (chosen arbitrarily) because
        // the reviver will give the same output for both of them
        // (i.e., an empty `Immutable.Map`).
        [SERIALIZED_TYPE_FIELD_NAME]:
          typeof firstKey === 'number' ? 'ImmutableMapNumKeys' : 'ImmutableMap',
      };
    }
    default: {
      // If the identity of the first item in the prototype chain
      // isn't good enough as a distinguishing mark, we can put some
      // plain conditions here.
    }
  }

  // Don't forget to handle a value's `toJSON` method, if present, as
  // described above.
  invariant(typeof origValue.toJSON !== 'function', 'unexpected toJSON');

  // If storing an interesting data type, don't forget to handle it
  // here, and in `reviver`.
  const origValuePrototype = Object.getPrototypeOf(origValue);
  invariant(
    // Flow bug: https://github.com/facebook/flow/issues/6110
    origValuePrototype === (Object.prototype: $FlowIssue)
      || origValuePrototype === (Array.prototype: $FlowIssue),
    'unexpected class',
  );

  // Ensure that objects with a [SERIALIZED_TYPE_FIELD_NAME] property
  // round-trip.
  if (SERIALIZED_TYPE_FIELD_NAME in origValue) {
    const copy = { ...origValue };
    delete copy[SERIALIZED_TYPE_FIELD_NAME];
    return {
      [SERIALIZED_TYPE_FIELD_NAME]: 'Object',
      data: copy,
      [SERIALIZED_TYPE_FIELD_NAME_ESCAPED]: origValue[SERIALIZED_TYPE_FIELD_NAME],
    };
  }

  return origValue;
}

/**
 * Custom reviver for inventive data types JSON doesn't handle.
 *
 * To be passed to `JSON.parse` as its second argument. New
 * reviving logic must also appear in `replacer` so they stay in
 * sync.
 */
function reviver(key, value) {
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
      case 'ImmutableList':
        return Immutable.List(data);
      case 'ImmutableMap':
        return Immutable.Map(data);
      case 'ImmutableMapNumKeys': {
        return Immutable.Map(Object.keys(data).map(k => [Number.parseInt(k, 10), data[k]]));
      }
      case 'Object':
        return {
          ...data,
          [SERIALIZED_TYPE_FIELD_NAME]: value[SERIALIZED_TYPE_FIELD_NAME_ESCAPED],
        };
      default:
        // This should be impossible for data that came from our
        // corresponding replacer, above.  If we do have a bug that leads to
        // this case, there's nothing we can return that isn't likely to be
        // a corrupt data structure that causes a crash somewhere else
        // downstream; so just fail immediately.
        throw new Error(`Unhandled serialized type: ${value[SERIALIZED_TYPE_FIELD_NAME]}`);
    }
  }
  return value;
}

export function stringify(data: mixed): string {
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
}

export function parse(data: string): mixed {
  return JSON.parse(data, reviver);
}
