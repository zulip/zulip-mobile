/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AnchoredScrollViewManager.h"

#import "RCTBridge.h"
#import "AnchoredScrollView.h"
#import "RCTUIManager.h"

@interface AnchoredScrollView (Private)

- (NSArray<NSDictionary *> *)calculateChildFramesData;

@end

@implementation RCTConvert (UIScrollView)

RCT_ENUM_CONVERTER(UIScrollViewKeyboardDismissMode, (@{
                                                       @"none": @(UIScrollViewKeyboardDismissModeNone),
                                                       @"on-drag": @(UIScrollViewKeyboardDismissModeOnDrag),
                                                       @"interactive": @(UIScrollViewKeyboardDismissModeInteractive),
                                                       // Backwards compatibility
                                                       @"onDrag": @(UIScrollViewKeyboardDismissModeOnDrag),
                                                       }), UIScrollViewKeyboardDismissModeNone, integerValue)

RCT_ENUM_CONVERTER(UIScrollViewIndicatorStyle, (@{
                                                  @"default": @(UIScrollViewIndicatorStyleDefault),
                                                  @"black": @(UIScrollViewIndicatorStyleBlack),
                                                  @"white": @(UIScrollViewIndicatorStyleWhite),
                                                  }), UIScrollViewIndicatorStyleDefault, integerValue)

@end

@implementation AnchoredScrollViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  return [[AnchoredScrollView alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

RCT_EXPORT_VIEW_PROPERTY(alwaysBounceHorizontal, BOOL)
RCT_EXPORT_VIEW_PROPERTY(alwaysBounceVertical, BOOL)
RCT_EXPORT_VIEW_PROPERTY(bounces, BOOL)
RCT_EXPORT_VIEW_PROPERTY(bouncesZoom, BOOL)
RCT_EXPORT_VIEW_PROPERTY(canCancelContentTouches, BOOL)
RCT_EXPORT_VIEW_PROPERTY(centerContent, BOOL)
RCT_EXPORT_VIEW_PROPERTY(automaticallyAdjustContentInsets, BOOL)
RCT_EXPORT_VIEW_PROPERTY(decelerationRate, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(directionalLockEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(indicatorStyle, UIScrollViewIndicatorStyle)
RCT_EXPORT_VIEW_PROPERTY(keyboardDismissMode, UIScrollViewKeyboardDismissMode)
RCT_EXPORT_VIEW_PROPERTY(maximumZoomScale, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(minimumZoomScale, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(pagingEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(scrollsToTop, BOOL)
RCT_EXPORT_VIEW_PROPERTY(showsHorizontalScrollIndicator, BOOL)
RCT_EXPORT_VIEW_PROPERTY(showsVerticalScrollIndicator, BOOL)
RCT_EXPORT_VIEW_PROPERTY(stickyHeaderIndices, NSIndexSet)
RCT_EXPORT_VIEW_PROPERTY(scrollEventThrottle, NSTimeInterval)
RCT_EXPORT_VIEW_PROPERTY(zoomScale, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(contentInset, UIEdgeInsets)
RCT_EXPORT_VIEW_PROPERTY(scrollIndicatorInsets, UIEdgeInsets)
RCT_EXPORT_VIEW_PROPERTY(snapToInterval, int)
RCT_EXPORT_VIEW_PROPERTY(snapToAlignment, NSString)
RCT_REMAP_VIEW_PROPERTY(contentOffset, scrollView.contentOffset, CGPoint)
RCT_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onScroll, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onScrollEndDrag, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMomentumScrollBegin, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMomentumScrollEnd, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onScrollAnimationEnd, RCTDirectEventBlock)

RCT_EXPORT_METHOD(getContentSize:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
  [self.bridge.uiManager addUIBlock:
   ^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, AnchoredScrollView *> *viewRegistry) {

     AnchoredScrollView *view = viewRegistry[reactTag];
     if (!view || ![view isKindOfClass:[AnchoredScrollView class]]) {
       RCTLogError(@"Cannot find AnchoredScrollView with tag #%@", reactTag);
       return;
     }

     CGSize size = view.scrollView.contentSize;
     callback(@[@{
                  @"width" : @(size.width),
                  @"height" : @(size.height)
                  }]);
   }];
}

RCT_EXPORT_METHOD(calculateChildFrames:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
  [self.bridge.uiManager addUIBlock:
   ^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, AnchoredScrollView *> *viewRegistry) {

     AnchoredScrollView *view = viewRegistry[reactTag];
     if (!view || ![view isKindOfClass:[AnchoredScrollView class]]) {
       RCTLogError(@"Cannot find AnchoredScrollView with tag #%@", reactTag);
       return;
     }

     NSArray<NSDictionary *> *childFrames = [view calculateChildFramesData];
     if (childFrames) {
       callback(@[childFrames]);
     }
   }];
}

RCT_EXPORT_METHOD(scrollTo:(nonnull NSNumber *)reactTag
                  offsetX:(CGFloat)x
                  offsetY:(CGFloat)y
                  animated:(BOOL)animated)
{
  [self.bridge.uiManager addUIBlock:
   ^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
     UIView *view = viewRegistry[reactTag];
     if ([view conformsToProtocol:@protocol(RCTScrollableProtocol)]) {
       [(id<RCTScrollableProtocol>)view scrollToOffset:(CGPoint){x, y} animated:animated];
     } else {
       RCTLogError(@"tried to scrollTo: on non-RCTScrollableProtocol view %@ "
                   "with tag #%@", view, reactTag);
     }
   }];
}

RCT_EXPORT_METHOD(zoomToRect:(nonnull NSNumber *)reactTag
                  withRect:(CGRect)rect
                  animated:(BOOL)animated)
{
  [self.bridge.uiManager addUIBlock:
   ^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
     UIView *view = viewRegistry[reactTag];
     if ([view conformsToProtocol:@protocol(RCTScrollableProtocol)]) {
       [(id<RCTScrollableProtocol>)view zoomToRect:rect animated:animated];
     } else {
       RCTLogError(@"tried to zoomToRect: on non-RCTScrollableProtocol view %@ "
                   "with tag #%@", view, reactTag);
     }
   }];
}

@end
