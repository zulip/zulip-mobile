/* @flow strict-local */
import md5 from 'blueimp-md5';

import {
  AvatarURL,
  GravatarURL,
  FallbackAvatarURL,
  UploadedAvatarURL,
  DEFAULT_UPLOAD_SIZE_PX,
  MEDIUM_UPLOAD_SIZE_PX,
} from '../avatar';
import * as eg from '../../__tests__/lib/exampleData';

describe('AvatarURL', () => {
  describe('fromUserOrBotData', () => {
    const user = eg.makeUser();
    const { email, user_id: userId } = user;
    const realm = eg.realm;

    test('gives a `FallbackAvatarURL` if `rawAvatarURL` is undefined', () => {
      const rawAvatarUrl = undefined;
      expect(AvatarURL.fromUserOrBotData({ rawAvatarUrl, userId, email, realm })).toBeInstanceOf(
        FallbackAvatarURL,
      );
    });

    test('gives a `GravatarURL` if `rawAvatarURL` is null', () => {
      const rawAvatarUrl = null;
      expect(AvatarURL.fromUserOrBotData({ rawAvatarUrl, userId, email, realm })).toBeInstanceOf(
        GravatarURL,
      );
    });

    test('gives a `GravatarURL` if `rawAvatarURL` is a URL string on Gravatar origin', () => {
      const rawAvatarUrl =
        'https://secure.gravatar.com/avatar/2efaec12efd9bea8a089299208117786?d=identicon&version=3';
      expect(AvatarURL.fromUserOrBotData({ rawAvatarUrl, userId, email, realm })).toBeInstanceOf(
        GravatarURL,
      );
    });

    test('gives an `UploadedAvatarURL` if `rawAvatarURL` is a non-Gravatar absolute URL string', () => {
      const rawAvatarUrl =
        'https://zulip-avatars.s3.amazonaws.com/13/430713047f2cffed661f84e139a64f864f17f286?x=x&version=5';
      expect(AvatarURL.fromUserOrBotData({ rawAvatarUrl, userId, email, realm })).toBeInstanceOf(
        UploadedAvatarURL,
      );
    });

    test('gives an `UploadedAvatarURL` if `rawAvatarURL` is a relative URL string', () => {
      const rawAvatarUrl =
        '/user_avatars/2/08fb6d007eb10a56efee1d64760fbeb6111c4352.png?x=x&version=2';
      expect(AvatarURL.fromUserOrBotData({ rawAvatarUrl, userId, email, realm })).toBeInstanceOf(
        UploadedAvatarURL,
      );
    });
  });
});

const SIZES_TO_TEST = [24, 32, 48, 80, 200, DEFAULT_UPLOAD_SIZE_PX, MEDIUM_UPLOAD_SIZE_PX];

describe('GravatarURL', () => {
  test('serializes/deserializes correctly', () => {
    const instance = GravatarURL.validateAndConstructInstance({ email: eg.selfUser.email });

    const roundTripped = GravatarURL.deserialize(GravatarURL.serialize(instance));

    SIZES_TO_TEST.forEach(size => {
      expect(instance.get(size).toString()).toEqual(roundTripped.get(size).toString());
    });
  });

  test('lowercases email address before hashing', () => {
    const email = 'uNuSuAlCaPs@example.com';
    const instance = GravatarURL.validateAndConstructInstance({ email });
    SIZES_TO_TEST.forEach(size => {
      expect(instance.get(size).toString()).toContain(md5('unusualcaps@example.com'));
    });
  });

  test('uses URL from server, if provided', () => {
    const email = 'user13313@chat.zulip.org';
    const urlFromServer =
      'https://secure.gravatar.com/avatar/de6685f1d3eb74439c1dcda84f92543e?d=identicon&version=1';
    const instance = GravatarURL.validateAndConstructInstance({
      email,
      urlFromServer,
    });
    SIZES_TO_TEST.forEach(size => {
      const clonedUrlOfSize = new URL(instance.get(size).toString());
      const clonedUrlFromServer = new URL(urlFromServer);
      clonedUrlFromServer.searchParams.delete('s');
      clonedUrlOfSize.searchParams.delete('s');
      // `urlFromServer` should equal the result for this size, modulo
      // the actual size param.
      expect(clonedUrlOfSize.toString()).toEqual(clonedUrlFromServer.toString());
    });
  });

  test('produces corresponding URLs for all sizes', () => {
    const instance = GravatarURL.validateAndConstructInstance({ email: eg.selfUser.email });

    SIZES_TO_TEST.forEach(size => {
      expect(instance.get(size).toString()).toContain(`s=${size.toString()}`);
    });
  });
});

describe('UploadedAvatarURL', () => {
  test('serializes/deserializes correctly', () => {
    const instance = UploadedAvatarURL.validateAndConstructInstance({
      realm: eg.realm,
      absoluteOrRelativeUrl:
        'https://zulip-avatars.s3.amazonaws.com/13/430713047f2cffed661f84e139a64f864f17f286?x=x&version=5',
    });

    const roundTripped = UploadedAvatarURL.deserialize(UploadedAvatarURL.serialize(instance));

    SIZES_TO_TEST.forEach(size => {
      expect(instance.get(size).toString()).toEqual(roundTripped.get(size).toString());
    });
  });

  test('if a relative URL, gives a URL on the given realm', () => {
    const instance = UploadedAvatarURL.validateAndConstructInstance({
      realm: new URL('https://chat.zulip.org'),
      absoluteOrRelativeUrl:
        '/user_avatars/2/e35cdbc4771c5e4b94e705bf6ff7cca7fa1efcae.png?x=x&version=2',
    });

    SIZES_TO_TEST.forEach(size => {
      const result = instance.get(size).toString();
      expect(
        result
          === 'https://chat.zulip.org/user_avatars/2/e35cdbc4771c5e4b94e705bf6ff7cca7fa1efcae.png?x=x&version=2'
          || result
            === 'https://chat.zulip.org/user_avatars/2/e35cdbc4771c5e4b94e705bf6ff7cca7fa1efcae-medium.png?x=x&version=2',
      ).toBeTrue();
    });
  });

  test('s3 uploads: appends -medum.png for sizes over default', () => {
    const instance = UploadedAvatarURL.validateAndConstructInstance({
      realm: new URL('https://chat.zulip.org'),
      absoluteOrRelativeUrl:
        'https://zulip-avatars.s3.amazonaws.com/13/430713047f2cffed661f84e139a64f864f17f286?x=x&version=5',
    });
    const sizesOverDefault = SIZES_TO_TEST.filter(s => s > DEFAULT_UPLOAD_SIZE_PX);
    const sizesAtMostDefault = SIZES_TO_TEST.filter(s => s <= DEFAULT_UPLOAD_SIZE_PX);
    sizesOverDefault.forEach(size => {
      expect(instance.get(size).toString()).toEqual(
        'https://zulip-avatars.s3.amazonaws.com/13/430713047f2cffed661f84e139a64f864f17f286-medium.png?x=x&version=5',
      );
    });
    sizesAtMostDefault.forEach(size => {
      expect(instance.get(size).toString()).toEqual(
        'https://zulip-avatars.s3.amazonaws.com/13/430713047f2cffed661f84e139a64f864f17f286?x=x&version=5',
      );
    });
  });

  test('local uploads: converts *.png to *-medium.png for sizes over default', () => {
    const realm = new URL('https://chat.zulip.org');
    const instance = UploadedAvatarURL.validateAndConstructInstance({
      realm,
      absoluteOrRelativeUrl:
        '/user_avatars/2/e35cdbc4771c5e4b94e705bf6ff7cca7fa1efcae.png?x=x&version=2',
    });
    const sizesOverDefault = SIZES_TO_TEST.filter(s => s > DEFAULT_UPLOAD_SIZE_PX);
    const sizesAtMostDefault = SIZES_TO_TEST.filter(s => s <= DEFAULT_UPLOAD_SIZE_PX);
    sizesOverDefault.forEach(size => {
      expect(instance.get(size).toString()).toEqual(
        'https://chat.zulip.org/user_avatars/2/e35cdbc4771c5e4b94e705bf6ff7cca7fa1efcae-medium.png?x=x&version=2',
      );
    });
    sizesAtMostDefault.forEach(size => {
      expect(instance.get(size).toString()).toEqual(
        'https://chat.zulip.org/user_avatars/2/e35cdbc4771c5e4b94e705bf6ff7cca7fa1efcae.png?x=x&version=2',
      );
    });
  });
});

describe('FallbackAvatarURL', () => {
  test('serializes/deserializes correctly', () => {
    const instance = FallbackAvatarURL.validateAndConstructInstance({
      realm: eg.realm,
      userId: eg.selfUser.user_id,
    });

    const roundTripped = FallbackAvatarURL.deserialize(FallbackAvatarURL.serialize(instance));

    SIZES_TO_TEST.forEach(size => {
      expect(instance.get(size).toString()).toEqual(roundTripped.get(size).toString());
    });
  });

  test('gives the `/avatar/{user_id}` URL, on the provided realm', () => {
    const userId = eg.selfUser.user_id;
    const instance = FallbackAvatarURL.validateAndConstructInstance({
      realm: new URL('https://chat.zulip.org'),
      userId,
    });

    const sizesOverDefault = SIZES_TO_TEST.filter(s => s > DEFAULT_UPLOAD_SIZE_PX);
    const sizesAtMostDefault = SIZES_TO_TEST.filter(s => s <= DEFAULT_UPLOAD_SIZE_PX);
    sizesOverDefault.forEach(size => {
      expect(instance.get(size).toString()).toEqual(
        `https://chat.zulip.org/avatar/${userId.toString()}/medium`,
      );
    });
    sizesAtMostDefault.forEach(size => {
      expect(instance.get(size).toString()).toEqual(
        `https://chat.zulip.org/avatar/${userId.toString()}`,
      );
    });
  });
});
