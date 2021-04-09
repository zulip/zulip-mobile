/* @flow strict-local */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
import md5 from 'blueimp-md5';

import * as logging from './logging';
import { ensureUnreachable, type UserId } from '../types';
import { isUrlAbsolute, isUrlPathAbsolute } from './url';

/**
 * Pixel dimensions of different size choices we have (they're all
 * square) when requesting an uploaded avatar.
 */
// DEFAULT_AVATAR_SIZE in zerver/lib/upload.py.
export const DEFAULT_UPLOAD_SIZE_PX = 100;
// MEDIUM_AVATAR_SIZE in zerver/lib/upload.py.
export const MEDIUM_UPLOAD_SIZE_PX = 500;

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
    userId: UserId,
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
        return GravatarURL.validateAndConstructInstance({ email, urlFromServer: rawAvatarUrl });
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
   * Pass the Gravatar URL string from the server, if we've got it, to
   * avoid doing an expensive `new URL` call.
   */
  // We should avoid doing unnecessary `new URL` calls here. They are
  // very expensive, and their use in these pseudo-constructors (which
  // process data at the edge, just as it's received from the server)
  // used to slow down `api.registerForEvents` quite a lot.
  //
  // In the past, we've been more conservative about validating a URL
  // string that comes to us from the server at this point: we'd parse
  // it with the URL constructor, grab the Gravatar hash from the
  // result, and construct another URL with that hash and exactly the
  // things we wanted it to have (like `d=identicon`).
  //
  // With some loss of validation, we've removed those two `new URL`
  // calls in the path where the server provides a Gravatar URL
  // string. Still, we should be able to trust that the server gives
  // us properly formatted URLs; if it didn't, it seems like the kind
  // of bug that would be fixed quickly.
  static validateAndConstructInstance(args: {|
    email: string,
    urlFromServer?: string,
  |}): GravatarURL {
    const { email, urlFromServer } = args;

    if (urlFromServer !== undefined) {
      // This may not be *quite* the URL we would have generated
      // ourselves. In the wild, I've seen one with a `version=1`, for
      // example. But we trust the server to give us one that works,
      // anyway -- and perhaps any extra things we get will be a good
      // bonus.
      return new GravatarURL(urlFromServer);
    } else {
      return new GravatarURL(
        // Thankfully, this string concatenation is quite safe: we
        // know enough about our inputs here to compose a properly
        // formatted URL with them, without using `new URL`.
        `${GravatarURL.ORIGIN}/avatar/${md5(email.toLowerCase())}?d=identicon`,
      );
    }
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

    /* $FlowFixMe[incompatible-call]: Make a new URL to mutate
       https://github.com/zulip/zulip-mobile/pull/4230#discussion_r512351202
       */
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
 * Note that this endpoint needs authentication; we should send the
 * auth headers (see src/api/transport) with the request.
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
  static validateAndConstructInstance(args: {| realm: URL, userId: UserId |}): FallbackAvatarURL {
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
 * DEFAULT_UPLOAD_SIZE_PX, medium is chosen:
 *  * default: DEFAULT_UPLOAD_SIZE_PX square
 *  * medium: MEDIUM_UPLOAD_SIZE_PX square
 *
 * Don't send auth headers with requests to this type of avatar URL.
 * The s3 backend doesn't want them; it gives a 400 with an
 * "Unsupported Authorization Type" message.
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
   * Expects a relative, path-absolute URL plus the realm for a local
   * upload; otherwise, an absolute URL of the avatar on the S3 backend.
   */
  static validateAndConstructInstance(args: {|
    realm: URL,
    absoluteOrRelativeUrl: string,
  |}): UploadedAvatarURL {
    const { realm, absoluteOrRelativeUrl } = args;

    // Ideally, we'd say `new URL(absoluteOrRelativeUrl, realm)`.
    // The URL constructor is too expensive; but we can do an exact
    // equivalent, given our assumptions on the kinds of URL strings
    // the server will send.
    let absoluteUrl = undefined;
    if (isUrlAbsolute(absoluteOrRelativeUrl)) {
      // An absolute URL string.  Ignore the base URL.
      absoluteUrl = absoluteOrRelativeUrl;
    } else if (isUrlPathAbsolute(absoluteOrRelativeUrl)) {
      // A path-absolute URL string, like `/avatar/…`.  We rely on our
      // assumption that the realm URL equals its origin, modulo the latter
      // having no trailing slash.
      absoluteUrl = `${realm.origin}${absoluteOrRelativeUrl}`;
    } else {
      const msg = 'Unexpected form of avatar URL from server';
      logging.error(msg, { avatarUrl: absoluteOrRelativeUrl });
      throw new Error(msg);
    }

    return new UploadedAvatarURL(absoluteUrl);
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
   * `sizePhysicalPx` should be an integer.
   */
  get(sizePhysicalPx: number): URL {
    // `this._standardUrl` may have begun its life as a string, to
    // avoid expensively calling the URL constructor
    if (typeof this._standardUrl === 'string') {
      this._standardUrl = new URL(this._standardUrl);
    }

    let result: URL = this._standardUrl;
    if (sizePhysicalPx > DEFAULT_UPLOAD_SIZE_PX) {
      /* $FlowFixMe[incompatible-call]: Make a new URL to mutate,
         instead of mutating this._standardUrl
         https://github.com/zulip/zulip-mobile/pull/4230#discussion_r512351202
         */
      result = new URL(this._standardUrl);

      result.pathname = result.pathname.replace(/(\w+)\.png/, (_, p1) => `${p1}-medium.png`);
    }
    return result;
  }
}
