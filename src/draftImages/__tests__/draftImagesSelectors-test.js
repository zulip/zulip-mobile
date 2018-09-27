import deepFreeze from 'deep-freeze';

import { getDraftImageData } from '../draftImagesSelectors';

describe('getDraftImageData', () => {
  test('return draft images if they exists', () => {
    const state = deepFreeze({
      draftImages: {
        '12345': 'some/img/url',
      },
    });

    const draftImages = getDraftImageData(state);
    expect(Object.keys(draftImages)).toHaveLength(1);
    expect(draftImages['12345']).toEqual('some/img/url');
  });

  test('return empty draft images', () => {
    const state = deepFreeze({
      draftImages: {},
    });

    const draftImages = getDraftImageData(state);
    expect(Object.keys(draftImages)).toHaveLength(0);
    expect(draftImages['12345']).toEqual(undefined);
  });
});
