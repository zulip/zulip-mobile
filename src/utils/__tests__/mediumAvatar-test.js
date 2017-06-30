import getMediumAvatar from '../mediumAvatar';

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
