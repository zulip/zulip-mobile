/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Platform, View } from 'react-native';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';

import { TranslationContext } from '../boot/TranslationProvider';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, Narrow, GetText } from '../types';
import { connect } from '../react-redux';
import * as logging from '../utils/logging';
import { showErrorAlert } from '../utils/info';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import {
  IconPlusCircle,
  IconLeft,
  IconPeople,
  IconImage,
  IconCamera,
  IconFile,
  IconVideo,
} from '../common/Icons';
import AnimatedComponent from '../animation/AnimatedComponent';
import { navigateToCreateGroup, uploadFile } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  expanded: boolean,
  destinationNarrow: Narrow,
  insertVideoCallLink: (() => void) | null,
  onExpandContract: () => void,
|}>;

/**
 * Adjust `fileName` to one with the right extension for the file format.
 *
 * Sometimes we get an image whose filename reflects one format (what it's
 * stored as in the camera roll), but the actual image has been converted
 * already to another format for interoperability.
 *
 * The Zulip server will infer the file format from the filename's
 * extension, so in this case we need to adjust the extension to match the
 * actual format.  The clue we get in the image-picker response is the extension
 * found in `uri`.
 *
 * Also if `fileName` is null or undefined, default to the last component of `uri`.
 */
export const chooseUploadImageFilename = (uri: string, fileName: ?string): string => {
  const name = fileName ?? uri.replace(/.*\//, '');

  /*
   * Photos in an iPhone's camera roll (taken since iOS 11) are typically in
   * HEIF format and have file names with the extension `.HEIC`.  When the user
   * selects one of these photos through the image picker, the file gets
   * automatically converted to JPEG format... but the `fileName` property in
   * the react-native-image-picker response still has the `.HEIC` extension.
   */
  if (/\.jpe?g$/i.test(uri)) {
    return name.replace(/\.heic$/i, '.jpeg');
  }

  return name;
};

class ComposeMenu extends PureComponent<Props> {
  static contextType = TranslationContext;
  context: GetText;

  uploadFile = async (uri: string, fileName: ?string) => {
    const _ = this.context;
    const { dispatch, destinationNarrow } = this.props;
    try {
      await dispatch(uploadFile(destinationNarrow, uri, chooseUploadImageFilename(uri, fileName)));
    } catch (e) {
      showErrorAlert(_('Failed to send file'));
    }
  };

  handleImagePickerResponse = (
    response: $ReadOnly<{
      didCancel: boolean,
      // Upstream docs are vague:
      // https://github.com/react-native-community/react-native-image-picker/blob/master/docs/Reference.md
      error?: string | void | null | false,
      uri: string,
      origURL?: string,
      // Upstream docs are wrong (fileName may indeed be null, at least on iOS);
      // surfaced in https://github.com/zulip/zulip-mobile/issues/3813:
      // https://github.com/react-native-community/react-native-image-picker/issues/1271
      fileName: ?string,
    }>,
    source: 'camera' | 'library',
  ) => {
    if (response.didCancel) {
      return;
    }

    // $FlowFixMe[sketchy-null-bool]: Upstream API is unclear.
    const error: string | null = response.error || null;
    if (error !== null) {
      showErrorAlert('Error', error);
      return;
    }

    const { uri, origURL } = response;

    let url: string;
    if (Platform.OS === 'android') {
      // We haven't had reports of inflated file sizes on Android.
      // Also, `origURL` is only given to us on iOS.
      url = uri;
    } else if (source === 'camera') {
      // We don't get an `origURL` for photos fresh from the camera.
      // Images straight from the camera on iOS will have inflated
      // sizes; see the comment in the `else` block.
      url = uri;
    } else if (origURL !== undefined) {
      // Point to the original image in the media library, if we can.
      //
      // We don't yet support image editing as part of choosing an
      // image to send, so there's no need to look at any other URL
      // besides this one. Unless...
      //
      // On iOS, v2 of react-native-image-picker, which we're on now,
      // uses a deprecated API to get this value. It's unclear when it
      // will actually be removed [1]; its doc says "Availability: iOS
      // 4.1-11.0", but that seems to be false, as I'm seeing
      // `origURL` present on iOS 13.7. So, this conditional.
      //
      // At least on iOS, the image won't be affected by the `quality`
      // prop. iOS's `UIImageJPEGRepresentation` will still be called
      // with the `quality` value, but the result will be ignored.
      //
      // [1] https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/JPEG.20file.20sizes/near/1116304
      url = origURL;
    } else {
      logging.warn('response.origURL missing; falling back on uri', { uri });

      // Fall back on a copy.
      //
      // For JPEGs sent from iOS, using this will likely mean the
      // server will receive a (much) larger file than it really
      // should.
      //
      // The reason is that the chosen image gets
      // decompressed/recompressed via iOS's
      // `UIImageJPEGRepresentation`, with a non-optimal
      // `compressionQuality` argument. Twice, actually -- and in the
      // second, we can't even prevent 1.0 (the highest, most
      // size-inflating value) from being used. There doesn't seem to
      // be an agreed-upon sensible value. [1]
      //
      // 1. First, react-native-image-picker v2 uses
      //    `UIImageJPEGRepresentation` on the image to save it to a
      //    temporary path, in case it's a just-edited image (we don't
      //    allow editing just before sending), or an image straight
      //    from the camera, that isn't in storage yet. At least we
      //    can (and do) tell the library to use a
      //    `compressionQuality` of less than 1.0, with the `quality`
      //    prop.
      //
      // 2. Second, React Native (as of v0.63.4) uses it in its
      //    `fetch` implementation on some image files before sending
      //    them [2]. We're not sure why (this would be good to find
      //    out), but RN does *not* seem to use it on a file at
      //    `origURL`. We don't have control over the
      //    `compressionQuality` here, and RN has chosen 1.0.
      //    Empirically, even if we use quite a low value in step 1,
      //    like 0.4, RN's choice of 1.0 means the size is inflated
      //    just about as much as it would be otherwise. [3]
      //
      // [1] Greg mentions that `compressionQuality` "may cause it to
      //     do more or less work to compress it *independent of the
      //     choices the compressor can make that cause loss of
      //     information*", emphasis mine.
      //
      // [2] https://github.com/facebook/react-native/issues/27099#issuecomment-602016225
      //
      // [3] https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/JPEG.20file.20sizes/near/1116532

      url = uri;
    }

    this.uploadFile(url, response.fileName);
  };

  handleImagePicker = () => {
    ImagePicker.launchImageLibrary(
      {
        // "Often suggested as a good balance". There doesn't seem to
        // be any better-established recommendation, and I don't
        // notice any horrible JPEG artifacts with this value.
        // https://stackoverflow.com/questions/26330492/what-should-compressionquality-be-when-using-uiimagejpegrepresentation
        //
        // Don't expect this to solve all problems with the size
        // getting inflated on iOS. Empirically, in cases where we
        // take the output of react-native-image-picker's
        // `UIImageJPEGRepresentation` call, which is the thing that
        // uses `quality`, React Native will apply its *own*
        // `UIImageJPEGRepresentation` call, with the quality set at
        // 1.0.
        //
        // See the comments on `url` in `handleImagePickerResponse`.
        quality: 0.7,

        noData: true,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      },
      response => this.handleImagePickerResponse(response, 'library'),
    );
  };

  handleCameraCapture = () => {
    const options = {
      // See the comment on this option for the image-picker launch.
      quality: 0.7,

      storageOptions: {
        cameraRoll: true,
        waitUntilSaved: true,
      },
    };

    ImagePicker.launchCamera(options, response =>
      this.handleImagePickerResponse(response, 'camera'),
    );
  };

  handleFilePicker = async () => {
    // Defer import to here, to avoid an obnoxious import-time warning
    // from this library when in the test environment.
    const DocumentPicker = (await import('react-native-document-picker')).default;

    let response = undefined;
    try {
      response = (await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      }): DocumentPickerResponse);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showErrorAlert('Error', e);
      }
      return;
    }

    this.uploadFile(response.uri, response.name);
  };

  styles = createStyleSheet({
    composeMenu: {
      flexDirection: 'row',
      overflow: 'hidden',
    },
    expandButton: {
      padding: 12,
      color: BRAND_COLOR,
    },
    composeMenuButton: {
      padding: 12,
      marginRight: -8,
      color: BRAND_COLOR,
    },
  });

  render() {
    const { expanded, insertVideoCallLink, onExpandContract } = this.props;
    const numIcons =
      3 + (Platform.OS === 'android' ? 1 : 0) + (insertVideoCallLink !== null ? 1 : 0);

    return (
      <View style={this.styles.composeMenu}>
        <AnimatedComponent
          stylePropertyName="width"
          fullValue={40 * numIcons}
          useNativeDriver={false}
          visible={expanded}
        >
          <View style={this.styles.composeMenu}>
            <IconPeople
              style={this.styles.composeMenuButton}
              size={24}
              onPress={() => {
                NavigationService.dispatch(navigateToCreateGroup());
              }}
            />
            {Platform.OS === 'android' && (
              <IconFile
                style={this.styles.composeMenuButton}
                size={24}
                onPress={this.handleFilePicker}
              />
            )}
            <IconImage
              style={this.styles.composeMenuButton}
              size={24}
              onPress={this.handleImagePicker}
            />
            <IconCamera
              style={this.styles.composeMenuButton}
              size={24}
              onPress={this.handleCameraCapture}
            />
            {insertVideoCallLink !== null ? (
              <IconVideo
                style={this.styles.composeMenuButton}
                size={24}
                onPress={insertVideoCallLink}
              />
            ) : null}
          </View>
        </AnimatedComponent>
        {!expanded && (
          <IconPlusCircle style={this.styles.expandButton} size={24} onPress={onExpandContract} />
        )}
        {expanded && (
          <IconLeft style={this.styles.expandButton} size={24} onPress={onExpandContract} />
        )}
      </View>
    );
  }
}

export default connect<{||}, _, _>()(ComposeMenu);
