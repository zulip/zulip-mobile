/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/*
 * Modified from RCTGIFImageDecoder.m for ZulipMobile
 */

#import "OptimizedGifDecoder.h"

#import <ImageIO/ImageIO.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <QuartzCore/QuartzCore.h>

#import <React/RCTUtils.h>

@implementation OptimizedGifDecoder

RCT_EXPORT_MODULE()

- (float) decoderPriority
{
  return CGFLOAT_MAX;
}

- (BOOL)canDecodeImageData:(NSData *)imageData
{
  char header[7] = {};
  [imageData getBytes:header length:6];

  return !strcmp(header, "GIF87a") || !strcmp(header, "GIF89a");
}

- (RCTImageLoaderCancellationBlock)decodeImageData:(NSData *)imageData
                                              size:(CGSize)size
                                             scale:(CGFloat)scale
                                        resizeMode:(RCTResizeMode)resizeMode
                                 completionHandler:(RCTImageLoaderCompletionBlock)completionHandler
{
  CGImageSourceRef imageSource = CGImageSourceCreateWithData((CFDataRef)imageData, NULL);
  UIImage *image = nil;

  // Don't bother creating an animation
  CGImageRef imageRef = CGImageSourceCreateImageAtIndex(imageSource, 0, NULL);
  if (imageRef) {
    image = [UIImage imageWithCGImage:imageRef scale:scale orientation:UIImageOrientationUp];
    CFRelease(imageRef);
  }
  CFRelease(imageSource);

  completionHandler(nil, image);
  return ^{};
}

@end
