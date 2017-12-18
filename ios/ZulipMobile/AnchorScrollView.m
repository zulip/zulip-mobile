/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/*
 * Modified for ZulipMobile
 */

#import "AnchorScrollView.h"
#import "UIView+Tag.h"
#import "UIView+React.h"

@interface RCTScrollView()
- (void) reactBridgeDidFinishTransaction;
- (CGPoint)calculateOffsetForContentSize:(CGSize)newContentSize;
- (void)scrollViewDidScroll:(UIScrollView *)scrollView;
- (void)sendScrollEventWithName:(NSString *)eventName
                     scrollView:(UIScrollView *)scrollView
                       userData:(NSDictionary *)userData;
- (NSArray *)calculateChildFramesData;
@end

@implementation AnchorScrollView
{
  __weak NSString *_anchorTag;
  CGPoint _lastAnchorPoint;
  CGPoint _lastContentOffset;
}

#define RCT_SEND_SCROLL_EVENT(_eventName, _userData) { \
NSString *eventName = NSStringFromSelector(@selector(_eventName)); \
[super sendScrollEventWithName:eventName scrollView:super.scrollView userData:_userData]; \
}

#define RCT_FORWARD_SCROLL_EVENT(call) \
NSHashTable *scrollListeners = [super valueForKey:@"_scrollListeners"]; \
for (NSObject<UIScrollViewDelegate> *scrollViewListener in scrollListeners) { \
if ([scrollViewListener respondsToSelector:_cmd]) { \
[scrollViewListener call]; \
} \
}

- (void) reactBridgeDidFinishTransaction
{
  [super reactBridgeDidFinishTransaction];
  [self findAnchor:false];
}

- (CGFloat) anchorChange
{
  UIView *contentView = [self contentView];
  if (_anchorTag) {
    __block UIView *anchorView = nil;
    [[contentView reactSubviews] enumerateObjectsUsingBlock:
     ^(UIView *anchor, __unused NSUInteger idx, BOOL *stop) {
       NSString *tagID = [anchor tagID];
       if (tagID && [tagID isEqualToString:_anchorTag]) {
         anchorView = anchor;
         *stop = YES;
         return;
       }
     }];
    if (anchorView) {
      return anchorView.frame.origin.y - _lastAnchorPoint.y;
    }
  }
  return CGFLOAT_MAX;
}

- (void) findAnchor:(BOOL)scrollingDown
{
  UIView *contentView = [self contentView];
  CGFloat scrollTop = self.scrollView.bounds.origin.y + self.scrollView.contentInset.top;
  CGFloat scrollBottom = self.scrollView.bounds.origin.y + self.scrollView.contentInset.top + self.scrollView.bounds.size.height;

  __block UIView *nextAnchor = nil;
  _anchorTag = nil;

  NSEnumerationOptions opts = scrollingDown ? NSEnumerationReverse : 0;
  [[contentView reactSubviews] enumerateObjectsWithOptions:opts usingBlock:
   ^(UIView *anchor, __unused NSUInteger idx, BOOL *stop) {
     if (![anchor tagID]) {
       return;
     }
     CGFloat height = anchor.bounds.size.height;
     CGFloat top = anchor.center.y - height * anchor.layer.anchorPoint.y;
     CGFloat bottom = anchor.center.y + height * anchor.layer.anchorPoint.y;

     if (!nextAnchor) {
       BOOL condition = scrollingDown ? top <= scrollBottom : bottom >= scrollTop;

       // Find the next anchor
       if (condition) {
         nextAnchor = anchor;
         _lastAnchorPoint = nextAnchor.frame.origin;
         _anchorTag = [anchor tagID];
         *stop = YES;
         return;
       }
     }
   }];
}

- (NSArray *) calculateVisibleViews
{
  NSMutableArray *visibleIds = [NSMutableArray new];
  CGFloat scrollTop = self.scrollView.bounds.origin.y + self.scrollView.contentInset.top;
  CGFloat scrollBottom = self.scrollView.bounds.origin.y + self.scrollView.contentInset.top + self.scrollView.bounds.size.height;

  [[self.contentView reactSubviews] enumerateObjectsUsingBlock:
   ^(UIView *anchor, __unused NSUInteger idx, __unused BOOL *stop) {
     NSString *tagID = [anchor tagID];
     if (!tagID) {
       return;
     }
     CGFloat height = anchor.bounds.size.height;
     CGFloat top = anchor.center.y - height * anchor.layer.anchorPoint.y;
     CGFloat bottom = anchor.center.y + height * anchor.layer.anchorPoint.y;
     if (bottom >= scrollTop && top <= scrollBottom) {
       [visibleIds addObject:tagID];
     }
   }];
  return visibleIds;
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
  BOOL allowNextScrollNoMatterWhat = [[super valueForKey:@"_allowNextScrollNoMatterWhat"] boolValue];
  NSTimeInterval lastScrollDispatchTime = [[super valueForKey:@"_lastScrollDispatchTime"] doubleValue];


  [super updateClippedSubviews];

  NSTimeInterval now = CACurrentMediaTime();

  BOOL scrollingDown = _lastContentOffset.y <= super.scrollView.contentOffset.y;
  [self findAnchor:scrollingDown];
  _lastContentOffset = self.scrollView.contentOffset;

  /**
   * TODO: this logic looks wrong, and it may be because it is. Currently, if _scrollEventThrottle
   * is set to zero (the default), the "didScroll" event is only sent once per scroll, instead of repeatedly
   * while scrolling as expected. However, if you "fix" that bug, ScrollView will generate repeated
   * warnings, and behave strangely (ListView works fine however), so don't fix it unless you fix that too!
   */
  if (allowNextScrollNoMatterWhat ||
      (super.scrollEventThrottle > 0 && super.scrollEventThrottle < (now - lastScrollDispatchTime))) {

    // Calculate changed frames
    NSArray<NSDictionary *> *childFrames = [super calculateChildFramesData];
    NSArray *visibleIds = [self calculateVisibleViews];

    // Dispatch event
    RCT_SEND_SCROLL_EVENT(onScroll, (@{
                                       @"updatedChildFrames": childFrames,
                                       @"visibleIds": visibleIds
                                      }));

    // Update dispatch time
    [super setValue:[NSNumber numberWithDouble:now] forKey:@"_lastScrollDispatchTime"];
    [super setValue:[NSNumber numberWithBool:NO] forKey:@"_allowNextScrollNoMatterWhat"];
  }
  RCT_FORWARD_SCROLL_EVENT(scrollViewDidScroll:scrollView);
}

- (CGPoint)calculateOffsetForContentSize:(CGSize)newContentSize
{
  CGPoint oldOffset = self.scrollView.contentOffset;
  CGPoint newOffset = [super calculateOffsetForContentSize:newContentSize];

  CGSize oldContentSize = self.scrollView.contentSize;

  // Adjust the offset based on the anchor
  CGFloat offsetHeight = oldOffset.y + self.bounds.size.height;
  CGFloat anchorChange = [self anchorChange];
  if (anchorChange != CGFLOAT_MAX) {
    if (self.autoScrollToBottom &&
        oldContentSize.height >= self.bounds.size.height &&
        offsetHeight >= oldContentSize.height) {
      newOffset.y = MAX(0, newContentSize.height - self.bounds.size.height);
    } else {
      newOffset.y = MAX(0, oldOffset.y + anchorChange);
    }
  } else {
    // offset falls outside of bounds, scroll back to end of list
    newOffset.y = MAX(0, newContentSize.height - self.bounds.size.height);
  }
  // Dispatch event
  // update scrollOfset at JS component
  RCT_SEND_SCROLL_EVENT(onScroll, (@{
                                     @"updatedChildFrames": @[],
                                     @"visibleIds": @[]
                                     }));
  return newOffset;
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps
{
  // Do nothing
  // This fixes a bug with section headers in RCTScrollView
}

@end
