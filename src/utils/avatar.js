/* @flow strict-local */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
import md5 from 'blueimp-md5';

import * as logging from './logging';
import { ensureUnreachable } from '../types';

/**
 * A way to get a standard avatar URL, or a sized one if available
 *
 * This class is abstract. Only instantiate its subclasses.
 */
export class AvatarURL {
  /**
   * From info on a user or bot, make the right subclass instance.
   */
  static fromUserOrBotData(args: {|
    rawAvatarUrl: string | void | null,
    userId: number,
    email: string,
    realm: URL,
  |}): AvatarURL {
    const { rawAvatarUrl, userId, email, realm } = args;
    if (rawAvatarUrl === undefined) {
      // New in Zulip 3.0, feature level 18, the field may be missing
      // on user objects in the register response, at the server's
      // discretion, if we announce the
      // `user_avatar_url_field_optional` client capability, which we
      // do. See the note about `user_avatar_url_field_optional` at
      // https://zulipchat.com/api/register-queue.
      //
      // It will also be absent on cross-realm bots from servers prior
      // to 58ee3fa8c (1.9.0). The effect of using FallbackAvatarURL for
      // this case isn't thoroughly considered, but at worst, it means a
      // 404. We could plumb through the server version and
      // conditionalize on that.
      return FallbackAvatarURL.validateAndConstructInstance({ realm, userId });
    } else if (rawAvatarUrl === null) {
      // If we announce `client_gravatar`, which we do, `rawAvatarUrl`
      // might be null. In that case, we take responsibility for
      // computing a hash for the user's email and using it to form a
      // URL for an avatar served by Gravatar.
      return GravatarURL.validateAndConstructInstance({ email });
    } else if (typeof rawAvatarUrl === 'string') {
      // If we don't announce `client_gravatar` (which we do), or if
      // the server doesn't have EMAIL_ADDRESS_VISIBILITY_EVERYONE
      // set, then `rawAvatarUrl` will be the absolute Gravatar URL
      // string.
      //
      // (In the latter case, we won't have real email addresses with
      // which to generate the correct hash; see
      // https://github.com/zulip/zulip/issues/15287. Implemented at
      // `do_events_register` in zerver/lib/events.py on the server.)
      if (
        rawAvatarUrl.startsWith(
          // Best not to use an expensive `new URL` call, when the
          // following is equivalent (assuming `rawAvatarUrl` is also
          // valid through its /pathname, ?query=params, and
          // #fragment). The trailing slash ensures that we've
          // examined the full origin in `rawAvatarUrl`.
          `${GravatarURL.ORIGIN}/`,
        )
      ) {
        const hashMatch = /[0-9a-fA-F]{32}$/.exec(new URL(rawAvatarUrl).pathname);
        if (hashMatch === null) {
          const msg = 'Unexpected Gravatar URL shape from server.';
          logging.error(msg, { value: rawAvatarUrl });
          throw new Error(msg);
        }
        return GravatarURL.validateAndConstructInstance({ email, hash: hashMatch[0] });
      }

      // Otherwise, it's a realm-uploaded avatar, either absolute or
      // relative, depending on how uploads are stored.
      return UploadedAvatarURL.validateAndConstructInstance({
        realm,
        absoluteOrRelativeUrl: rawAvatarUrl,
      });
    } else {
      ensureUnreachable(rawAvatarUrl);
      const msg = 'Unexpected value for `rawAvatarUrl` in `AvatarURL.fromUserOrBotData`';
      logging.error(msg, { value: rawAvatarUrl });
      throw new Error(msg);
    }
  }

  /* eslint-disable-next-line class-methods-use-this */
  get(sizePhysicalPx: number): URL {
    throw new Error('unimplemented');
  }
}

/**
 * A Gravatar URL with a hash we compute from an email address.
 *
 * See http://secure.gravatar.com/site/implement/images/, which covers
 * the size options.
 */
export class GravatarURL extends AvatarURL {
  /**
   * Serialize to a special string; reversible with `deserialize`.
   */
  static serialize(instance: GravatarURL): string {
    return instance._standardUrl instanceof URL
      ? instance._standardUrl.toString()
      : instance._standardUrl;
  }

  /**
   * Use a special string from `serialize` to make a new instance.
   */
  static deserialize(serialized: string): GravatarURL {
    return new GravatarURL(serialized);
  }

  /**
   * Construct from raw server data, or throw an error.
   *
   * Pass the hash if the server provides it, to avoid computing it
   * unnecessarily.
   */
  static validateAndConstructInstance(args: {| email: string, hash?: string |}): GravatarURL {
    const { email, hash = md5(email.toLowerCase()) } = args;

    const standardSizeUrl = new URL(`/avatar/${hash}`, GravatarURL.ORIGIN);
    standardSizeUrl.searchParams.set('d', 'identicon');

    return new GravatarURL(standardSizeUrl);
  }

  static ORIGIN = 'https://secure.gravatar.com';

  /**
   * Standard URL from which to generate others. PRIVATE.
   *
   * May be a string if the instance was constructed at rehydrate
   * time, when URL validation is unnecessary.
   */
  _standardUrl: string | URL;

  /**
   * PRIVATE: Make an instance from already-validated data.
   *
   * Not part of the public interface; use the static methods instead.
   *
   * It's private because we need a path to constructing an instance
   * without constructing URL objects, which takes more time than is
   * acceptable when we can avoid it, e.g., during rehydration.
   * Constructing URL objects is a necessary part of validating data
   * from the server, but we only need to validate the data once, when
   * it's first received.
   */
  constructor(standardUrl: string | URL) {
    super();
    this._standardUrl = standardUrl;
  }

  /**
   * Get a URL object for the given size.
   *
   * `sizePhysicalPx` must be an integer. (Gravatar doesn't advertise
   * the ability to specify noninteger values for the size.)
   */
  get(sizePhysicalPx: number): URL {
    // `this._standardUrl` may have begun its life as a string, to
    // avoid computing a URL object during rehydration
    if (typeof this._standardUrl === 'string') {
      this._standardUrl = new URL(this._standardUrl);
    }

    // Make a new URL to mutate
    // $FlowFixMe - https://github.com/zulip/zulip-mobile/pull/4230#discussion_r512351202
    const result: URL = new URL(this._standardUrl);
    result.searchParams.set('s', sizePhysicalPx.toString());
    return result;
  }
}

/**
 * The /avatar/{user_id} redirect.
 *
 * See the point on `user_avatar_url_field_optional` at
 * https://zulipchat.com/api/register-queue.
 *
 * This endpoint does not currently support size customization.
 */
export class FallbackAvatarURL extends AvatarURL {
  /**
   * Serialize to a special string; reversible with `deserialize`.
   */
  static serialize(instance: FallbackAvatarURL): string {
    return instance._standardUrl instanceof URL
      ? instance._standardUrl.toString()
      : instance._standardUrl;
  }

  /**
   * Use a special string from `serialize` to make a new instance.
   */
  static deserialize(serialized: string): FallbackAvatarURL {
    return new FallbackAvatarURL(serialized);
  }

  /**
   * Construct from raw server data (the user ID), or throw an error.
   *
   * The `realm` must be already validated, e.g., by coming from the
   * Redux state.
   */
  // We should avoid doing unnecessary `new URL` calls here. They are
  // very expensive, and their use in these pseudo-constructors (which
  // process data at the edge, just as it's received from the server)
  // used to slow down `api.registerForEvents` quite a lot.
  static validateAndConstructInstance(args: {| realm: URL, userId: number |}): FallbackAvatarURL {
    const { realm, userId } = args;
    // Thankfully, this string concatenation is quite safe: we know
    // enough about our inputs here to compose a properly formatted
    // URL with them, without using `new URL`. (In particular,
    // `realm.origin` doesn't have a trailing slash.)
    return new FallbackAvatarURL(`${realm.origin}/avatar/${userId.toString()}`);
  }

  /**
   * Standard URL from which to generate others. PRIVATE.
   *
   * May start out as a string, and will be converted to a URL object
   * in the first `.get()` call.
   */
  _standardUrl: string | URL;

  /**
   * PRIVATE: Make an instance from already-validated data.
   *
   * Not part of the public interface; use the static methods instead.
   */
  constructor(standardUrl: string | URL) {
    super();
    this._standardUrl = standardUrl;
  }

  /**
   * Get a URL object for the given size.
   *
   * Size customization isn't currently supported for
   * FallbackAvatarURLs.
   *
   * Still, we'll take `sizePhysicalPx` (it should be an integer), to
   * make it easy to support in the future.
   */
  get(sizePhysicalPx: number): URL {
    // `this._standardUrl` may have begun its life as a string, to
    // avoid expensively calling the URL constructor
    if (typeof this._standardUrl === 'string') {
      this._standardUrl = new URL(this._standardUrl);
    }

    return this._standardUrl;
  }
}

/**
 * An avatar that was uploaded to the Zulip server.
 *
 * There are two size options; if `sizePhysicalPx` is greater than
 * 100, medium is chosen:
 *  * default: 100x100
 *  * medium: 500x500
 */
export class UploadedAvatarURL extends AvatarURL {
  /**
   * Serialize to a special string; reversible with `deserialize`.
   */
  static serialize(instance: UploadedAvatarURL): string {
    return instance._standardUrl instanceof URL
      ? instance._standardUrl.toString()
      : instance._standardUrl;
  }

  /**
   * Use a special string from `serialize` to make a new instance.
   */
  static deserialize(serialized: string): UploadedAvatarURL {
    return new UploadedAvatarURL(serialized);
  }

  /**
   * Construct from raw server data, or throw an error.
   *
   * Expects a relative URL plus the realm for a local upload;
   * otherwise, an absolute URL of the avatar on the S3 backend.
   */
  static validateAndConstructInstance(args: {|
    realm: URL,
    absoluteOrRelativeUrl: string,
  |}): UploadedAvatarURL {
    const { realm, absoluteOrRelativeUrl } = args;
    // If `absoluteOrRelativeUrl` is absolute, the second argument
    // is ignored.
    return new UploadedAvatarURL(new URL(absoluteOrRelativeUrl, realm));
  }

  /**
   * Standard URL from which to generate others. PRIVATE.
   *
   * May be a string if the instance was constructed at rehydrate
   * time, when URL validation is unnecessary.
   */
  _standardUrl: string | URL;

  /**
   * PRIVATE: Make an instance from already-validated data.
   *
   * Not part of the public interface; use the static methods instead.
   *
   * It's private because we need a path to constructing an instance
   * without constructing URL objects, which takes more time than is
   * acceptable when we can avoid it, e.g., during rehydration.
   * Constructing URL objects is a necessary part of validating data
   * from the server, but we only need to validate the data once, when
   * it's first received.
   */
  constructor(standardUrl: string | URL) {
    super();
    this._standardUrl = standardUrl;
  }

  /**
   * Get a URL object for the given size.
   *
   * `sizePhysicalPx` should be an integer.
   */
  get(sizePhysicalPx: number): URL {
    // `this._standardUrl` may have begun its life as a string, to
    // avoid computing a URL object during rehydration
    if (typeof this._standardUrl === 'string') {
      this._standardUrl = new URL(this._standardUrl);
    }

    let result: URL = this._standardUrl;
    if (sizePhysicalPx > 100) {
      // Make a new URL to mutate, instead of mutating this._standardUrl
      // $FlowFixMe - https://github.com/zulip/zulip-mobile/pull/4230#discussion_r512351202
      result = new URL(this._standardUrl);

      const match = new RegExp(/(\w+)\.png/g).exec(result.pathname);
      if (match !== null) {
        result.pathname = result.pathname.replace(match[0], `${match[1]}-medium.png`);
      }
    }
    return result;
  }
}
