/* @flow strict-local */
import { getMediumAvatar, getGravatarFromEmail } from '../avatar';

// avatarUrl can be converted to retrieve medium sized avatars(mediumAvatarUrl) if and only if
// avatarUrl contains avatar image name with a .png extension (e.g. AVATAR_IMAGE_NAME.png).

describe('getMediumAvatar', () => {
  test('if avatarUrl can be converted into mediumAvatarUrl, return mediumAvatarUrl', () => {
    const avatarUrl = '/user_avatars/AVATAR_IMAGE_NAME.png/';
    const mediumAvatarUrl = '/user_avatars/AVATAR_IMAGE_NAME-medium.png/';

    const resultUrl = getMediumAvatar(avatarUrl);

    expect(resultUrl).toEqual(mediumAvatarUrl);
  });

  test('if avatarUrl cannot be converted into mediumAvatarUrl, return avatarUrl itself', () => {
    const avatarUrl = '/avatar/AVATAR_IMAGE_NAME/';

    const resultUrl = getMediumAvatar(avatarUrl);

    expect(resultUrl).toEqual(avatarUrl);
  });
});

describe('getGravatarFromEmail', () => {
  test('given an email return gravatar url', () => {
    expect(getGravatarFromEmail('test@example.com', 80)).toEqual(
      'https://secure.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?d=identicon&s=80',
    );
  });

  test('given a case-sensitive email canonize and return gravatar url', () => {
    expect(getGravatarFromEmail('Test@example.com', 80)).toEqual(
      'https://secure.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?d=identicon&s=80',
    );
  });
});
